<raw>
	<script>
		var dirty = opts.content;

		var sanitizeHtml = require('sanitize-html');
		var clean = sanitizeHtml(dirty);
		clean = sanitizeHtml(dirty, {
			allowedTags: [
				'b', 'i', 'u', 'a',
				'em', 'strong',
				'p',
				'pre', 'code',
				'h1', 'h2', 'h3', 'h4', 'h5',
				'ul', 'ol', 'li',
			],
			allowedAttributes: {
				'a': [ 'href' ],
				'img': [ 'src' ],
			},
			allowedSchemes: [ 'http', 'https', 'ftp', 'mailto' ],
		});
	    this.root.innerHTML = clean;
    </script>
</raw>