<div class="wrap" id="wedocs-app">

    <h1><?php _e( 'Documentations', 'wedocs' ); ?> <a class="page-title-action" href="#" v-on:click.prevent="addDoc"><?php _e( 'Add Doc', 'wedocs' ); ?></a></h1>

    <!-- <pre>{{ $data }}</pre> -->

    <span class="spinner is-active" style="float: none;"></span>

    <ul class="docs not-loaded" v-sortable>
        <li class="single-doc" v-for="(doc, index) in docs" :data-id="doc.id">
            <h3>
                <a v-if="doc.caps.edit" target="_blank" :href="editurl + doc.id">{{ doc.title.rendered }}<span v-if="doc.status != 'publish'" class="doc-status">{{ doc.status }}</span></a>
                <span v-else>{{ doc.title.rendered }}<span v-if="doc.status != 'publish'" class="doc-status">{{ doc.status }}</span></span>

                <span class="wedocs-row-actions">
                    <a target="_blank" :href="viewurl + doc.id" title="<?php esc_attr_e( 'Preview the doc', 'wedocs' ); ?>"><span class="dashicons dashicons-external"></span></a>
                    <span v-if="doc.caps.delete" class="wedocs-btn-remove" v-on:click="removeDoc(doc)" title="<?php esc_attr_e( 'Delete this doc', 'wedocs' ); ?>"><span class="dashicons dashicons-trash"></span></span>
                    <span class="wedocs-btn-reorder"><span class="dashicons dashicons-menu"></span></span>
                </span>
            </h3>

            <div class="inside">
                <ul class="sections" v-sortable>
                    <li v-for="(section, index) in doc.children" :data-id="section.id">
                        <span class="section-title" v-on:click="toggleCollapse">
                            <a v-if="section.caps.edit" target="_blank" :href="editurl + section.id">{{ section.title.rendered }}<span v-if="section.status != 'publish'" class="doc-status">{{ section.status }}</span> <span v-if="section.children.length > 0" class="count">{{ section.children.length }}</span></a>
                            <span v-else>{{ section.title.rendered }}<span v-if="section.status != 'publish'" class="doc-status">{{ section.status }}</span> <span v-if="section.children.length > 0" class="count">{{ section.children.length }}</span></span>

                            <span class="actions wedocs-row-actions">
                                <span class="wedocs-btn-reorder" title="<?php esc_attr_e( 'Re-order this section', 'wedocs' ); ?>"><span class="dashicons dashicons-menu"></span></span>
                                <a target="_blank" :href="viewurl + section.id" title="<?php esc_attr_e( 'Preview the section', 'wedocs' ); ?>"><span class="dashicons dashicons-external"></span></a>
                                <span class="wedocs-btn-remove" v-if="section.caps.delete" v-on:click="removeSection(section)" title="<?php esc_attr_e( 'Delete this section', 'wedocs' ); ?>"><span class="dashicons dashicons-trash"></span></span>
                                <span class="add-article" v-on:click="addArticle(section,$event)" title="<?php esc_attr_e( 'Add a new article', 'wedocs' ); ?>"><span class="dashicons dashicons-plus-alt"></span></span>
                            </span>
                        </span>

                        <ul class="articles collapsed connectedSortable" v-if="section.children" v-sortable>
                            <li class="article" v-for="(article, index) in section.children" :data-id="article.id">

                                <span>
                                    <a v-if="article.caps.edit" target="_blank" :href="editurl + article.id">{{ article.title.rendered }}<span v-if="article.status != 'publish'" class="doc-status">{{ article.status }}</span></a>
                                    <span v-else>{{ article.title.rendered }}</span>

                                    <span class="actions wedocs-row-actions">
                                        <span class="wedocs-btn-reorder"><span class="dashicons dashicons-menu"></span></span>
                                        <a target="_blank" :href="viewurl + article.id" title="<?php esc_attr_e( 'Preview the article', 'wedocs' ); ?>"><span class="dashicons dashicons-external"></span></a>
                                        <span class="wedocs-btn-remove" v-if="article.caps.delete" v-on:click="removeArticle(article)" title="<?php esc_attr_e( 'Delete this article', 'wedocs' ); ?>"><span class="dashicons dashicons-trash"></span></span>
                                    </span>
                                </span>

                                <ul class="articles" v-if="article.children.length">
                                    <li v-for="(art, index) in article.children">
                                        <a v-if="art.caps.edit" target="_blank" :href="editurl + art.id">{{ art.title.rendered }}<span v-if="art.status != 'publish'" class="doc-status">{{ art.status }}</span></a>
                                        <span v-else>{{ art.title.rendered }}</span>

                                        <span class="actions wedocs-row-actions">
                                            <a target="_blank" :href="viewurl + article.id" title="<?php esc_attr_e( 'Preview the article', 'wedocs' ); ?>"><span class="dashicons dashicons-external"></span></a>
                                            <span class="wedocs-btn-remove" v-if="art.caps.delete" v-on:click="removeArticle(article)" title="<?php esc_attr_e( 'Delete this article', 'wedocs' ); ?>"><span class="dashicons dashicons-trash"></span></span>
                                        </span>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>

            <div class="add-section">
                <a class="button button-primary" href="#" v-on:click.prevent="addSection(doc)"><?php _e( 'Add Section', 'wedocs' ); ?></a>
            </div>
        </li>
    </ul>

    <div class="no-docs not-loaded" v-show="!docs.length">
        <?php printf( __( 'No docs has been found. Perhaps %s?', 'wedocs' ), '<a href="#" v-on:click.prevent="addDoc">' . __( 'create one', 'wedocs' ) . '</a>' ); ?>
    </div>

</div>
