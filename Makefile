PYTHON3 = python3
PYTHON2 = python2.6
JAVA    = java

REVISION := $(shell git rev-parse --short HEAD)

all: validate-html buildtoc clean init minimize-html minimize-js minimize-css combine-js build-sitemap substitute-minimized-scripts-and-css remove-unused-css-selectors add-revision-number-to-manifests set-file-permissions

validate-html:
	{ for f in *.html; do python3 util/validate.py "$$f" > /dev/null || exit 1; done }

buildtoc:
	${PYTHON3} util/buildtoc.py

clean:
	rm -rf build

init: clean
	mkdir build
	mkdir build/fonts-original
	cp robots.txt .htaccess *.css *.ico build/
	cp -R j build/
	cp -R i build/
	cp -R f build/
	cp -R s build/
	cp -R examples build/
	cp fonts-original/*.tar.gz build/fonts-original/

minimize-html: init
	{ for f in *.html; do python3 util/htmlminimizer.py "$$f" build/"$$f" || exit 1; done }
	sed -i -e "s|;</script>|</script>|g" build/*.html

minimize-js: init
	${JAVA} -jar util/compiler.jar -js build/j/dih5.js > build/j/dih5.min.js
	${JAVA} -jar util/compiler.jar -js build/j/canvastext-fx3.js > build/j/canvastext-fx3.min.js

minimize-css: init
	sed -i -e "s|url(i/|url(//d.wearehugh.com/dih5/|g" build/screen.css
	java -jar util/yuicompressor-2.4.2.jar build/screen.css > build/${REVISION}.css
	java -jar util/yuicompressor-2.4.2.jar build/mobile.css > build/m-${REVISION}.css
	sed -i -e "s|;}|}|g" -e "s|\"|'|g" build/${REVISION}.css
	sed -i -e "s|;}|}|g" -e "s|\"|'|g" build/m-${REVISION}.css

combine-js: minimize-js
	cat build/j/legal.js build/j/jquery.min.js build/j/modernizr.min.js build/j/canvastext-fx3.min.js build/j/dih5.min.js > build/j/diveintohtml5-common-${REVISION}.min.js
	cat build/j/legal.js build/j/gears_init.min.js build/j/geo.min.js > build/j/diveintohtml5-common-${REVISION}-maps.min.js

build-sitemap: minimize-html
	ls build/*.html | sed -e "s|build/|http://diveintohtml5.org/|g" -e "s|/index.html|/|g" > build/sitemap.txt

substitute-minimized-scripts-and-css: minimize-html minimize-js minimize-css combine-js
	sed -i -e "s|<script src=j/jquery.js></script>||g" \
		-e "s|<script src=j/modernizr.js></script>||g" \
		-e "s|<script src=j/gears_init.js></script>||g" \
		-e "s|<script src=j/geo.js>|<script src=j/diveintohtml5-common-${REVISION}-maps.min.js>|g" \
		-e "s|<script src=j/canvastext-fx3.js></script>||g" \
		-e "s|<script src=j/dih5.js>|<script src=j/diveintohtml5-common-${REVISION}.min.js>|g" \
		-e "s|<link rel=stylesheet href=screen.css>|<style>$(shell cat build/${REVISION}.css)</style>|g" \
		-e "s|<link rel=stylesheet media='only screen and (max-device-width: 480px)' href=mobile.css>|<style>@media screen and (max-device-width:480px){$(shell cat build/m-${REVISION}.css)}</style>|g" \
		-e "s|</style><style>||g" \
		-e "s|</style>|</style>$(shell cat j/ga.js)|1" \
		-e "s|=http:|=|g" \
		-e "s|href=index.html|href=/|g" \
		build/*.html

remove-unused-css-selectors: substitute-minimized-scripts-and-css
	{ for f in build/*.html; do ${PYTHON2} util/lesscss.py "$$f" || exit 1; done }

add-revision-number-to-manifests: init
	sed -i -e "s|# revision|# revision ${REVISION}|g" build/examples/offline/clock.appcache
	sed -i -e "s|# revision|# revision ${REVISION}|g" build/examples/offline/halma.appcache

set-file-permissions: init
	chmod 644 build/*.html build/*.txt build/*.ico build/examples/* build/examples/.htaccess build/j/* build/j/.htaccess build/i/* build/i/.htaccess build/f/* build/f/.htaccess build/.htaccess build/fonts-original/*.tar.gz build/s/*
	chmod 755 build/examples build/j build/i build/f build/fonts-original build/examples/offline build/examples/history build/examples/history/gallery build/s
	chmod 644 build/examples/offline/* build/examples/offline/.htaccess build/examples/history/*.html build/examples/history/*.css build/examples/history/*.js build/examples/history/gallery/*

live: all
	rsync -essh -a --exclude="*.mp4" --exclude="*.ogv" --exclude="*.webm" build/i/* build/i/.htaccess diveintomark@diveintomark.webfactional.com:~/webapps/wearehugh/dih5/
	rsync -essh -a build/i/*.mp4 build/i/*.ogv build/i/*.webm build/i/.htaccess diveintomark@diveintomark.webfactional.com:~/webapps/diveintohtml5/i/
	rsync -essh -a build/j/diveintohtml5-common-${REVISION}*.js build/j/html5.js build/j/excanvas.min.js build/j/jquery.js build/j/.htaccess diveintomark@diveintomark.webfactional.com:~/webapps/diveintohtml5/j/
	rsync -essh -a build/f/*.ttf build/f/*.eot build/f/*.woff build/f/*.svg build/f/.htaccess diveintomark@diveintomark.webfactional.com:~/webapps/diveintohtml5/f/
	rsync -essh -a build/examples build/*.txt build/*.ico build/*.html build/.htaccess build/fonts-original build/s diveintomark@diveintomark.webfactional.com:~/webapps/diveintohtml5/
