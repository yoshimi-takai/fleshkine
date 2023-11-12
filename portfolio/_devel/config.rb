cache = false
asset_cache_buster :none
unix_newlines = true

require 'compass/import-once/activate'
# Require any additional compass plugins here.

# Set this to the root of your project when deployed:
http_path = "/"
css_dir = "../assets/css"
sass_dir = "sass"
images_dir = "../assets/img"
javascripts_dir = "../assets/js"

http_images_path = "/assets/img"
relative_assets = true
output_style = :expanded

line_comments = false


# If you prefer the indented syntax, you might want to regenerate this
# project again passing --syntax sass, or you can uncomment this:
# preferred_syntax = :sass
# and then run:
# sass-convert -R --from scss --to sass sass scss && rm -rf sass && mv scss sass
