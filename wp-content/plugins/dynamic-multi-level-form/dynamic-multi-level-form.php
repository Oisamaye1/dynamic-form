<?php
/**
 * Plugin Name: Dynamic Multi-Level Form
 * Description: A dynamic multi-level form with progress tracking
 * Version: 1.0.0
 * Author: Your Name
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class DynamicMultiLevelForm {
    
    public function __construct() {
        // Register scripts and styles
        add_action('wp_enqueue_scripts', array($this, 'register_scripts'));
        
        // Add shortcode
        add_shortcode('dynamic_form', array($this, 'render_form_shortcode'));
        
        // Register REST API endpoint for form submission
        add_action('rest_api_init', array($this, 'register_api_endpoints'));
        
        // Load admin functionality
        if (is_admin()) {
            require_once plugin_dir_path(__FILE__) . 'admin/admin-page.php';
        }
    }
    
    public function register_scripts() {
        // Register React and dependencies
        wp_register_script('react', 'https://unpkg.com/react@18/umd/react.production.min.js', array(), '18.0.0', true);
        wp_register_script('react-dom', 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js', array('react'), '18.0.0', true);
        
        // Register Framer Motion
        wp_register_script('framer-motion', 'https://unpkg.com/framer-motion@10.16.4/dist/framer-motion.min.js', array('react'), '10.16.4', true);
        
        // Register our custom scripts
        wp_register_script(
            'dynamic-form-script', 
            plugins_url('build/index.js', __FILE__), 
            array('react', 'react-dom', 'framer-motion', 'wp-element'), 
            '1.0.0', 
            true
        );
        
        // Register our styles
        wp_register_style(
            'dynamic-form-style',
            plugins_url('build/style.css', __FILE__),
            array(),
            '1.0.0'
        );
        
        // Localize script with WordPress data
        wp_localize_script('dynamic-form-script', 'dynamicFormData', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'restUrl' => rest_url('dynamic-form/v1/submit'),
            'nonce' => wp_create_nonce('wp_rest'),
        ));
    }
    
    public function render_form_shortcode($atts) {
        // Enqueue scripts and styles
        wp_enqueue_script('dynamic-form-script');
        wp_enqueue_style('dynamic-form-style');
        
        // Create container for React to mount to
        return '<div id="dynamic-form-container" class="dynamic-form-wrapper"></div>';
    }
    
    public function register_api_endpoints() {
        register_rest_route('dynamic-form/v1', '/submit', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_form_submission'),
            'permission_callback' => function() {
                return true; // Public endpoint
            }
        ));
    }
    
    public function handle_form_submission($request) {
        // Get form data
        $form_data = $request->get_json_params();
        
        if (empty($form_data)) {
            return new WP_Error('no_data', 'No form data received', array('status' => 400));
        }
        
        // Process form data
        $submission_id = $this->save_form_submission($form_data);
        
        if (!$submission_id) {
            return new WP_Error('save_failed', 'Failed to save form submission', array('status' => 500));
        }
        
        // Return success response
        return array(
            'success' => true,
            'submission_id' => $submission_id,
            'message' => 'Form submitted successfully'
        );
    }
    
    private function save_form_submission($form_data) {
        global $wpdb;
        
        // Insert into custom table
        $table_name = $wpdb->prefix . 'form_submissions';
        
        $result = $wpdb->insert(
            $table_name,
            array(
                'form_data' => json_encode($form_data),
                'created_at' => current_time('mysql'),
                'user_id' => get_current_user_id(),
                'ip_address' => $_SERVER['REMOTE_ADDR']
            ),
            array('%s', '%s', '%d', '%s')
        );
        
        if ($result) {
            return $wpdb->insert_id;
        }
        
        return false;
    }
    
    // Activation hook
    public static function activate() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'form_submissions';
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            form_data longtext NOT NULL,
            created_at datetime NOT NULL,
            user_id bigint(20) NOT NULL,
            ip_address varchar(100) NOT NULL,
            PRIMARY KEY  (id)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
}

// Initialize the plugin
$dynamic_multi_level_form = new DynamicMultiLevelForm();

// Register activation hook
register_activation_hook(__FILE__, array('DynamicMultiLevelForm', 'activate'));
