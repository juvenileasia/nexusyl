# HTML package to connect GOL IBE with a custom website

In this guide, you will find out how to insert the code of the package into a website and how to adjust it.

## First time usage

1. Open any index.[lang].html file in a server environment (for example with npm package `serve`).
1. You should see fully working search form in colors of your GOL IBE frontend.

# Inserting into a custom website

1. Copy folder `static` and make it accessible in the root of your website server. Like `http://example.com/static/...`
1. In previously opened file index.[lang].html, select the content of `<div class="main-wrapper">` and insert it to the place you want to have it on your website.
1. Copy files config.[lang].js and `HTMLPackageControl.js` to the root of your website server.
1. Copy folder `hotels` and make it accessible in the root of your website server. Like `http://example.com/hotels/...`
1. In previously opened file index.[lang].html, select all `<link ...>` codes from the `<header>` part and copy it to the header of the page you want to have this form on.

# Adjusting

The easiest way to adjust functionality is to edit config files, but you can also change the JavaScript controller itself and change virtually anything.

## Adjusting settingsURL

Open config.[lang].js and edit any variable you want and after refreshing, you will see what it changes.

## Adjusting CSS colors and view

1. Debug the corresponding CSS setting in a browser console.
1. Change the code in `static/styles.css`

## Adjusting anything else

1. Open `HTMLPackageControl.js`
1. Edit any function you want.

## Other useful information

- the code is built on top of the GOL IBE frontend. Any change you make there will result in changing the package code (during the build phase).
- it is usually easier to change the settings in ADMIN CONSOLE and regenerate the package.
