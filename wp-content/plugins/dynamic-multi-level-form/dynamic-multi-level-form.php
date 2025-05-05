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

// Include template loader
require_once plugin_dir_path(__FILE__) . 'includes/template-loader.php';

class DynamicMultiLevelForm {
    
    public function __construct() {
        // Register scripts and styles
        add_action('wp_enqueue_scripts', array($this, 'register_scripts'));
        
        // Add shortcode
        add_shortcode('dynamic_form', array($this, 'render_form_shortcode'));
        
        // Register REST API endpoint for form submission
        add_action('rest_api_init', array($this, 'register_api_endpoints'));
        
        // Add headers for iframe embedding
        add_action('send_headers', array($this, 'add_iframe_headers'));
        
        // Load admin functionality
        if (is_admin()) {
            require_once plugin_dir_path(__FILE__) . 'admin/admin-page.php';
            
            // Add settings page
            add_action('admin_menu', array($this, 'add_settings_page'));
            add_action('admin_init', array($this, 'register_settings'));
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
    
    /**
     * Add headers to allow iframe embedding
     */
    public function add_iframe_headers() {
        // Only add headers on pages with our shortcode
        global $post;
        if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'dynamic_form')) {
            // Get allowed domains from settings
            $allowed_domains = get_option('dynamic_form_allowed_domains', '');
            
            if (!empty($allowed_domains)) {
                // Remove X-Frame-Options header if it exists
                header_remove('X-Frame-Options');
                
                // Set Content-Security-Policy to allow specific domains
                $domains = array_map('trim', explode(',', $allowed_domains));
                $frame_ancestors = implode(' ', array_map(function($domain) {
                    return "https://$domain";
                }, $domains));
                
                header("Content-Security-Policy: frame-ancestors 'self' $frame_ancestors");
                
                // Add CORS headers
                $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
                foreach ($domains as $domain) {
                    if (strpos($origin, $domain) !== false) {
                        header("Access-Control-Allow-Origin: $origin");
                        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
                        header("Access-Control-Allow-Headers: Content-Type, X-WP-Nonce");
                        break;
                    }
                }
            }
        }
    }
    
    /**
     * Add settings page
     */
    public function add_settings_page() {
        add_submenu_page(
            'dynamic-form-submissions', // Parent slug
            'Form Settings', // Page title
            'Settings', // Menu title
            'manage_options', // Capability
            'dynamic-form-settings', // Menu slug
            array($this, 'render_settings_page') // Callback function
        );
    }
    
    /**
     * Register settings
     */
    public function register_settings() {
        register_setting('dynamic_form_settings', 'dynamic_form_allowed_domains');
        
        add_settings_section(
            'dynamic_form_iframe_section',
            'iframe Embedding Settings',
            array($this, 'iframe_section_callback'),
            'dynamic_form_settings'
        );
        
        add_settings_field(
            'dynamic_form_allowed_domains',
            'Allowed Domains',
            array($this, 'allowed_domains_callback'),
            'dynamic_form_settings',
            'dynamic_form_iframe_section'
        );
    }
    
    /**
     * Section callback
     */
    public function iframe_section_callback() {
        echo '<p>Configure domains that are allowed to embed this form in an iframe.</p>';
    }
    
    /**
     * Field callback
     */
    public function allowed_domains_callback() {
        $allowed_domains = get_option('dynamic_form_allowed_domains', '');
        echo '<textarea name="dynamic_form_allowed_domains" rows="3" cols="50" class="large-text">' . esc_textarea($allowed_domains) . '</textarea>';
        echo '<p class="description">Enter comma-separated list of domains without http/https (e.g., example.com, app.vercel.app)</p>';
    }
    
    /**
     * Render settings page
     */
    public function render_settings_page() {
        ?>
        <div class="wrap">
            <h1>Dynamic Form Settings</h1>
            <form method="post" action="options.php">
                <?php
                settings_fields('dynamic_form_settings');
                do_settings_sections('dynamic_form_settings');
                submit_button();
                ?>
            </form>
            
            <div class="card" style="max-width: 800px; margin-top: 20px; padding: 20px; background: #fff; border: 1px solid #ccd0d4; box-shadow: 0 1px 1px rgba(0,0,0,.04);">
                <h2>How to Embed in Next.js</h2>
                <p>To embed this form in your Next.js application, use the following code:</p>
                
                <pre style="background: #f5f5f5; padding: 15px; overflow: auto;">
// components/WordPressForm.js
'use client'

import { useState, useEffect } from 'react'

export default function WordPressForm() {
  const [height, setHeight] = useState(500)
  
  useEffect(() => {
    // Listen for messages from the iframe
    const handleMessage = (event) => {
      // Make sure the message is from your WordPress site
      if (event.origin === 'https://your-wordpress-site.com') {
        if (event.data.type === 'formHeight') {
          setHeight(event.data.height)
        }
      }
    }
    
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])
  
  return (
    <div className="wordpress-form-container">
      <iframe 
        src="https://your-wordpress-site.com/form-page/" 
        width="100%" 
        height={height} 
        frameBorder="0"
        title="Dynamic Form"
        style={{ 
          transition: 'height 0.3s ease',
          minHeight: '500px'
        }}
      />
    </div>
  )
}
                </pre>
                
                <p>Add this component to any page in your Next.js application:</p>
                
                <pre style="background: #f5f5f5; padding: 15px; overflow: auto;">
// app/contact/page.js
import WordPressForm from '@/components/WordPressForm'

export default function ContactPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <WordPressForm />
    </div>
  )
}
                </pre>
            </div>
        </div>
        <?php
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
