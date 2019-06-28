/* jshint devel:true */
/* global Vue */
/* global weDocs */
/* global wp */
/* global swal */
/* global ajaxurl */


$.ajaxSetup({
    beforeSend: function(xhr) {
        xhr.setRequestHeader('X-WP-Nonce', wpApiSettings.nonce);
    }
});

Vue.directive('sortable', {
    bind: function(el, binding) {
        var $el = jQuery(el);

        $el.sortable({
            handle: '.wedocs-btn-reorder',
            stop: function(event, ui) {
                var ids = [];

                jQuery( ui.item.closest('ul') ).children('li').each(function(index, el) {
                    ids.push( jQuery(el).data('id'));
                });

                wp.ajax.post({
                    action: 'wedocs_sortable_docs',
                    ids: ids,
                    _wpnonce: weDocs.nonce
                });
            },
            cursor: 'move',
            // connectWith: ".connectedSortable"
        });
    }
});

new Vue({
    el: '#wedocs-app',
    data: {
        editurl: '',
        viewurl: '',
        rawDocs: []
    },

    computed:  {
        docs: function() {
            if (!this.rawDocs) {
                return this.rawDocs;
            }

            return this.buildTree(this.rawDocs);
        }
    },

    mounted: function() {

        this.editurl = weDocs.editurl;
        this.viewurl = weDocs.viewurl;

        // dom.find('ul.docs').removeClass('not-loaded').addClass('loaded');

        this.fetchAllDocs();
    },

    methods: {

        endpoint: function(end) {
            return window.wpApiSettings.root + window.weDocs.rest + end;
        },

        fetchAllDocs() {
            var self = this,
                dom = jQuery( self.$el );

            new Promise(function(resolve, reject) {
                self.fetchDocs(1, [], resolve, reject);
            })
            .then(function(response) {
                self.rawDocs = response;

                dom.find('.spinner').remove();
                dom.find('.no-docs').removeClass('not-loaded');
                dom.find('ul.docs').removeClass('not-loaded').addClass('loaded');
            });
        },

        fetchDocs(page, docs, resolve, reject) {
            var self = this;

            let url = this.endpoint('/docs?per_page=100&context=edit&status[]=publish&status[]=draft&status[]=pending&page=' + page);

            return jQuery.get(url)
                .done(function(data, statux, xhr) {
                    docs = docs.concat(data);

                    let totalPages = parseInt(xhr.getResponseHeader('X-WP-TotalPages'));

                    if (page < totalPages ) {
                        self.fetchDocs(page+1, docs, resolve, reject)
                    } else {
                        resolve(docs);
                    }
                })
                .fail(function() {
                    reject('Something went wrong');
                });
        },

        onError: function(error) {
            alert(error);
        },

        addDoc: function() {

            var that = this;
            this.rawDocs = this.rawDocs || [];

            swal({
                title: weDocs.enter_doc_title,
                type: "input",
                showCancelButton: true,
                closeOnConfirm: true,
                animation: "slide-from-top",
                inputPlaceholder: weDocs.write_something
            }, function(inputValue){
                if (inputValue === false) {
                    return false;
                }

                jQuery.post(that.endpoint('/docs'), {
                    title: inputValue,
                    parent: 0
                }).done(function(response) {
                    that.rawDocs.unshift( response );
                });

            });
        },

        removeDoc: function(doc, docs) {
            var self = this;

            swal({
                title: "Are you sure?",
                text: "Are you sure to delete the entire documentation? Sections and articles inside this doc will be deleted too!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false
            }, function() {
                self.removePost(doc, docs);
            });
        },

        addSection: function(doc) {
            swal({
                title: weDocs.enter_section_title,
                type: "input",
                showCancelButton: true,
                closeOnConfirm: true,
                animation: "slide-from-top",
                inputPlaceholder: weDocs.write_something
            }, function(inputValue){
                if (inputValue === false) {
                    return false;
                }

                inputValue = inputValue.trim();

                if ( inputValue ) {
                    wp.ajax.send( {
                        data: {
                            action: 'wedocs_create_doc',
                            title: inputValue,
                            parent: doc.post.id,
                            order: doc.child.length,
                            _wpnonce: weDocs.nonce
                        },
                        success: function(res) {
                            doc.child.push( res );
                        },
                        error: this.onError
                    });
                }
            });
        },

        removeSection: function(section) {
            var self = this;

            swal({
                title: "Are you sure?",
                text: "Are you sure to delete the entire section? Articles inside this section will be deleted too!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false
            }, function() {
                self.removePost(section);
            });
        },

        addArticle: function(section, event) {
            var parentEvent = event;

            swal({
                title: weDocs.enter_doc_title,
                type: "input",
                showCancelButton: true,
                closeOnConfirm: true,
                animation: "slide-from-top",
                inputPlaceholder: weDocs.write_something
            }, function(inputValue){
                if (inputValue === false) {
                    return false;
                }

                wp.ajax.send( {
                    data: {
                        action: 'wedocs_create_doc',
                        title: inputValue,
                        parent: section.post.id,
                        status: 'draft',
                        order: section.child.length,
                        _wpnonce: weDocs.nonce
                    },
                    success: function(res) {
                        section.child.push( res );

                        var articles = jQuery( parentEvent.target ).closest('.section-title').next();

                        if ( articles.hasClass('collapsed') ) {
                            articles.removeClass('collapsed');
                        }
                    },
                    error: function(error) {
                        alert( error );
                    }
                });
            });
        },

        removeArticle: function(article) {
            var self = this;

            swal({
                title: "Are you sure?",
                text: "Are you sure to delete the article?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false
            }, function(){
                self.removePost(article);
            });
        },

        removePost: function(doc, message) {
            message = message || 'This post has been deleted';

            var self = this;

            jQuery.ajax({
                url: this.endpoint('/docs/' + doc.id),
                type: 'DELETE',
                success: function() {
                    swal( 'Deleted!', message, 'success' );
                    self.rawDocs.splice(self.rawDocs.indexOf(doc), 1);
                }
            });

            // wp.ajax.send( {
            //     data: {
            //         action: 'wedocs_remove_doc',
            //         id: items[index].id,
            //         _wpnonce: weDocs.nonce
            //     },
            //     success: function() {
            //         Vue.delete(items, index);
            //         swal( 'Deleted!', message, 'success' );
            //     },
            //     error: function(error) {
            //         alert( error );
            //     }
            // });
        },

        toggleCollapse: function(event) {
            jQuery(event.target).siblings('ul.articles').toggleClass('collapsed');
        },

        buildTree: function (items) {
            const tree = [];

            // Cache found parent index
            const map = {};

            items.forEach(node => {
                if (!node.hasOwnProperty('children')) {
                    node.children = [];
                }

                // No parentId means top level
                if (!node.parent) {
                    return tree.push(node);
                }

                // Insert node as child of parent in flat array
                let parentIndex = map[node.parent];

                if (typeof parentIndex !== "number") {
                    parentIndex = items.findIndex(el => el.id === node.parent);
                    map[node.parent] = parentIndex;
                }

                if (!items[parentIndex].children) {
                    return items[parentIndex].children = [node];
                }

                items[parentIndex].children.push(node);
            });

            return tree;
        }
    },
});
