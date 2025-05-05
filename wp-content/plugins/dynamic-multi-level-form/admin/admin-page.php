<?php
// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class DynamicFormAdmin {
    
    public function __construct() {
        // Add admin menu
        add_action('admin_menu', array($this, 'add_admin_menu'));
        
        // Add admin scripts and styles
        add_action('admin_enqueue_scripts', array($this, 'admin_scripts'));
    }
    
    public function add_admin_menu() {
        add_menu_page(
            'Dynamic Form Submissions',
            'Form Submissions',
            'manage_options',
            'dynamic-form-submissions',
            array($this, 'render_admin_page'),
            'dashicons-feedback',
            30
        );
    }
    
    public function admin_scripts($hook) {
        if ($hook != 'toplevel_page_dynamic-form-submissions') {
            return;
        }
        
        wp_enqueue_style('dynamic-form-admin-style', plugins_url('assets/admin-style.css', dirname(__FILE__)));
        wp_enqueue_script('dynamic-form-admin-script', plugins_url('assets/admin-script.js', dirname(__FILE__)), array('jquery'), '1.0.0', true);
    }
    
    public function render_admin_page() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'form_submissions';
        
        // Handle deletion
        if (isset($_GET['action']) && $_GET['action'] == 'delete' && isset($_GET['id'])) {
            $id = intval($_GET['id']);
            $wpdb->delete($table_name, array('id' => $id), array('%d'));
            echo '<div class="notice notice-success is-dismissible"><p>Submission deleted successfully.</p></div>';
        }
        
        // Get submissions with pagination
        $page = isset($_GET['paged']) ? max(1, intval($_GET['paged'])) : 1;
        $per_page = 20;
        $offset = ($page - 1) * $per_page;
        
        $total_items = $wpdb->get_var("SELECT COUNT(id) FROM $table_name");
        $total_pages = ceil($total_items / $per_page);
        
        $submissions = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM $table_name ORDER BY created_at DESC LIMIT %d OFFSET %d",
                $per_page,
                $offset
            )
        );
        
        ?>
        <div class="wrap">
            <h1>Dynamic Form Submissions</h1>
            
            <?php if (empty($submissions)): ?>
                <div class="notice notice-info">
                    <p>No form submissions yet.</p>
                </div>
            <?php else: ?>
                <table class="wp-list-table widefat fixed striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Date</th>
                            <th>User</th>
                            <th>Form Type</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($submissions as $submission): 
                            $form_data = json_decode($submission->form_data, true);
                            $form_type = isset($form_data['purpose']) ? ucfirst($form_data['purpose']) : 'Unknown';
                            $user_info = '';
                            
                            if ($submission->user_id) {
                                $user = get_user_by('id', $submission->user_id);
                                $user_info = $user ? $user->user_login : 'User ID: ' . $submission->user_id;
                            } else {
                                $user_info = 'Anonymous';
                            }
                        ?>
                            <tr>
                                <td><?php echo $submission->id; ?></td>
                                <td><?php echo date('M j, Y g:i a', strtotime($submission->created_at)); ?></td>
                                <td><?php echo esc_html($user_info); ?></td>
                                <td><?php echo esc_html($form_type); ?></td>
                                <td>
                                    <a href="?page=dynamic-form-submissions&action=view&id=<?php echo $submission->id; ?>" class="button button-small">View</a>
                                    <a href="?page=dynamic-form-submissions&action=delete&id=<?php echo $submission->id; ?>" class="button button-small" onclick="return confirm('Are you sure you want to delete this submission?')">Delete</a>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
                
                <?php if ($total_pages > 1): ?>
                    <div class="tablenav bottom">
                        <div class="tablenav-pages">
                            <span class="displaying-num"><?php echo $total_items; ?> items</span>
                            <span class="pagination-links">
                                <?php
                                echo paginate_links(array(
                                    'base' => add_query_arg('paged', '%#%'),
                                    'format' => '',
                                    'prev_text' => '&laquo;',
                                    'next_text' => '&raquo;',
                                    'total' => $total_pages,
                                    'current' => $page
                                ));
                                ?>
                            </span>
                        </div>
                    </div>
                <?php endif; ?>
            <?php endif; ?>
        </div>
        <?php
        
        // View single submission
        if (isset($_GET['action']) && $_GET['action'] == 'view' && isset($_GET['id'])) {
            $id = intval($_GET['id']);
            $submission = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $id));
            
            if ($submission) {
                $form_data = json_decode($submission->form_data, true);
                ?>
                <div class="wrap">
                    <h2>Submission Details</h2>
                    <p><a href="?page=dynamic-form-submissions" class="button">&larr; Back to List</a></p>
                    
                    <div class="submission-details">
                        <h3>Submission Information</h3>
                        <table class="form-table">
                            <tr>
                                <th>ID</th>
                                <td><?php echo $submission->id; ?></td>
                            </tr>
                            <tr>
                                <th>Date</th>
                                <td><?php echo date('F j, Y g:i a', strtotime($submission->created_at)); ?></td>
                            </tr>
                            <tr>
                                <th>IP Address</th>
                                <td><?php echo esc_html($submission->ip_address); ?></td>
                            </tr>
                            <?php if ($submission->user_id): ?>
                                <tr>
                                    <th>User</th>
                                    <td>
                                        <?php 
                                        $user = get_user_by('id', $submission->user_id);
                                        echo $user ? esc_html($user->user_login) . ' (' . esc_html($user->user_email) . ')' : 'User ID: ' . $submission->user_id;
                                        ?>
                                    </td>
                                </tr>
                            <?php endif; ?>
                        </table>
                        
                        <h3>Form Data</h3>
                        <div class="form-data">
                            <?php
                            // Group questions by section
                            $sections = array();
                            
                            foreach ($form_data as $key => $value) {
                                $section_name = explode('_', $key)[0];
                                if (!isset($sections[$section_name])) {
                                    $sections[$section_name] = array();
                                }
                                $sections[$section_name][$key] = $value;
                            }
                            
                            foreach ($sections as $section_name => $fields):
                            ?>
                                <div class="form-section">
                                    <h4><?php echo ucfirst($section_name); ?></h4>
                                    <table class="wp-list-table widefat fixed">
                                        <thead>
                                            <tr>
                                                <th>Field</th>
                                                <th>Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <?php foreach ($fields as $key => $value): ?>
                                                <tr>
                                                    <td><?php echo ucwords(str_replace('_', ' ', $key)); ?></td>
                                                    <td><?php echo esc_html($value); ?></td>
                                                </tr>
                                            <?php endforeach; ?>
                                        </tbody>
                                    </table>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                </div>
                <?php
            }
        }
    }
}

// Initialize admin
$dynamic_form_admin = new DynamicFormAdmin();
