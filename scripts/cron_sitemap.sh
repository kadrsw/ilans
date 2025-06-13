```bash
#!/bin/bash

# Log file path
LOG_FILE="/var/log/sitemap_generator.log"

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Create log file if it doesn't exist
touch "$LOG_FILE"

# Log start
log_message "Starting sitemap generation"

# Navigate to project directory
cd /home/project || exit 1

# Run the Python script
if python3 scripts/generate_sitemap.py; then
    log_message "Sitemap generated successfully"
    
    # Ping search engines
    curl -s "http://www.google.com/ping?sitemap=https://isilanlarim.org/sitemap.xml" > /dev/null
    curl -s "http://www.bing.com/ping?sitemap=https://isilanlarim.org/sitemap.xml" > /dev/null
    
    log_message "Search engines pinged"
    
    # Check if we have multiple sitemap files
    if [ -f "public/sitemap-jobs-1.xml" ]; then
        log_message "Multiple sitemap files detected"
        
        # Get the number of sitemap files
        sitemap_count=$(ls public/sitemap-jobs-*.xml | wc -l)
        log_message "Found $sitemap_count job sitemap files"
        
        # Ping search engines for each job sitemap
        for sitemap in public/sitemap-jobs-*.xml; do
            sitemap_name=$(basename "$sitemap")
            log_message "Pinging search engines for $sitemap_name"
            
            curl -s "http://www.google.com/ping?sitemap=https://isilanlarim.org/$sitemap_name" > /dev/null
            curl -s "http://www.bing.com/ping?sitemap=https://isilanlarim.org/$sitemap_name" > /dev/null
        done
    fi
else
    log_message "Error generating sitemap"
    exit 1
fi

# Log completion
log_message "Sitemap generation completed"
```