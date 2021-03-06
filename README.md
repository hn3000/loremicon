
# Simple Lorem Icon service

TL;DR:

- bookmarkable image urls
- pseudo random images
- uses `node-canvas` and `express`
- simple frontend to try out the service is at /help-me/
- if you want really permanent permalinks to the images, 
  you should host this yourself somewhere, a dockerfile is included


A service to create random but bookmarkable placeholder images.

The service takes a number of parameters, you can see the structure of
the image URLs on the page at `/help-me/` (it is linked from the index page).

# Image URL patterns

These URL patterns will return an image, the shorter URL patterns
always redirect to the fully specified format.

- Just Dimensions: `/:x/:y`
- Style + Dimensions: `/:style/:x/:y`
- Style, Dimensions, Format: `/:style/:x/:y/:format`
- Fully specified: `/:style/:x/:y/:seed/:format`

Dimensions (`:x` and `:y`) can be specified without unit, which will be taken as
`px`.

Other supported units are:

 - `pt` -- either 96ppi or 72dpi (for :format = pdf)
 - `in` -- either 96pixels or 72pixels (for :format = pdf)
 - `cm` -- converted at 2.54 cm / in
 - `mm` -- converted at 25.4 cm / in
 - `px` -- same as not specifying a unit

Supported `:format` values:

- `png` -- lossless compression, ideal for icons; the default value
- `jpeg` -- lossy compression, ideal for larger gradient images
- `jpg` -- same as `jpeg`
- `svg` -- vector format, pre-sized to given size
- `pdf` -- your favourite paper replacement format

These will redirect you to a data: URL containing the generated image:

- `datapng` -- convert image to png and encode as data: url
- `datajpeg` -- convert image to jpeg and encode as data: url
- `data` -- convert image to png and jpeg and redirect to the shorter one encoded as data: url

Examples:

- <https://loremicon.com/ngon/16/16/64110306/jpeg> (16x16 pixel jpeg)
- <https://loremicon.com/ngon/297mm/210mm/64110306/pdf> (a4 pdf)
- <https://loremicon.com/grad/20pt/20pt/64110306/svg> (20pt svg)

To get additional control over the generated image, some part
of the randomly determined image parameters can be overridden
using the `:extra` part of the image URL (and this is only supported
as an extension of the fully specified form, for now):

- Extended specification: `/:style/:x/:y/:seed/:extra/:format`

The `:extra` can be specified as either of these:

- `colors=&lt;hexcolor&gt;,&lt;hexcolor&gt;,...`
- `colors=&lt;color&gt;;&lt;color&gt;;...`
- `palette=&lt;hexcolor&gt;,&lt;hexcolor&gt;,...`
- `palette=&lt;color&gt;;&lt;color&gt;;...`

where the colors are either 3 or 6 hexadecimal digits (when separated with commas) or just general color strings (when separated with semicolons).

So these are equivalent:

1. ![0ff,00f](https://loremicon.com/ngon/16/16/64110306/colors=0ff,00f/jpeg) `/ngon/128/128/64110306/colors=0ff,00f/jpeg` 
1. ![cyan;blue](https://loremicon.com/ngon/16/16/64110306/colors=cyan;blue/jpeg) `/ngon/128/128/64110306/palette=cyan;blue/jpeg`
1. ![rgb(0 255 255);rgb(0 0 255)](https://loremicon.com/ngon/16/16/64110306/colors=cyan;blue/jpeg) `/ngon/128/128/64110306/palette=rgb(0 255 255);rgb(0 0 255)/jpeg`
1. ![rgb(0,255,255);rgb(0,0,255)](https://loremicon.com/ngon/16/16/64110306/colors=cyan;blue/jpeg) `/ngon/128/128/64110306/palette=rgb(0,255,255);rgb(0,0,255)/jpeg`

Note: the spaces in the third example must, of course, be escaped as %20, but browsers should also accept commas as in the fourth example.

# Styles

The following examples all use the same seed, so will not change on reload:

![/grad/128/128/577251899890/jpg](https://loremicon.com/grad/128/128/577251899890/jpg)
<br>`/grad/128/128/577251899890/jpg`
<br>grad: Random number of gradient stops, random angle

![/poly/128/128/577251899890/jpg](https://loremicon.com/poly/128/128/577251899890/jpg)
<br>`/poly/128/128/577251899890/jpg`
<br>poly: Polygon, random number of vertices

![/ngon/128/128/577251899890/jpg](https://loremicon.com/ngon/128/128/577251899890/jpg)
<br>`/ngon/128/128/577251899890/jpg`
<br>ngon: Regular N-Gon, random number of edges / corners

![/rect/128/128/577251899890/jpg](https://loremicon.com/rect/128/128/577251899890/jpg)
<br>`/rect/128/128/577251899890/jpg`
<br>rect: Random number of rectangles at random coordinates

![/pxls/128/128/577251899890/jpg](https://loremicon.com/pxls/128/128/577251899890/jpg)
<br>`/pxls/128/128/577251899890/jpg`
<br>pxls: Just random noise, more useful with color palette

![/lclr/128/128/577251899890/jpg](https://loremicon.com/lclr/128/128/577251899890/jpg)
<br>`/lclr/128/128/577251899890/jpg`
<br>lclr: light colors (an experiment with color)

![/dclr/128/128/577251899890/jpg](https://loremicon.com/dclr/128/128/577251899890/jpg)
<br>`/dclr/128/128/577251899890/jpg`
<br>dclr: dark colors (another experiment with colors)

![/mclr/128/128/577251899890/jpg](https://loremicon.com/mclr/128/128/577251899890/jpg)
<br>`/mclr/128/128/577251899890/jpg`
<br>mclr: mixed colors (yet another experiment with colors)

## Random Styles

Two kinds of random:

![/drnd/128/128/577251899890/jpg](https://loremicon.com/drnd/128/128/577251899890/jpg)
<br>`/drnd/128/128/577251899890/jpg`
<br>(Deterministic based on seed)

![/rndm/128/128/577251899890/jpg](https://loremicon.com/rndm/128/128/577251899890/jpg)
<br>`/rndm/128/128/577251899890/jpg`
<br>(Completely random, does not depend on seed, different every time, but always 
one of the above since it uses the same seed)

# More examples

![/poly/128/128/577251899890/jpg](https://loremicon.com/poly/128/128/577251899890/jpg)<br>`/poly/128/128/577251899890/jpg`

![/ngon/128/128/264039499501/jpg](https://loremicon.com/ngon/128/128/264039499501/png)<br>`/ngon/128/128/264039499501/png`

![/poly/128/128/486310823847/jpg](https://loremicon.com/poly/128/128/486310823847/jpg)<br>`/poly/128/128/486310823847/jpg`

![/poly/128/128/13188643/png](https://loremicon.com/poly/128/128/13188643/png)<br>`/poly/128/128/13188643/png`

![/grad/128/128/14942979907/jpg](https://loremicon.com/grad/128/128/14942979907/jpg)<br>`/grad/128/128/14942979907/jpg`

![/poly/128/128/13188643/colors=red;yellow/png](https://loremicon.com/poly/128/128/13188643/colors=red;yellow/png)<br>`/poly/128/128/13188643/colors=red;yellow/png`

![/pxls/128/128/64110306/colors=333,343,353,363,373,383,393,3a3/jpeg](https://loremicon.com/pxls/128/128/64110306/colors=333,343,353,363,373,383,393,3a3/jpeg)<br>`/pxls/128/128/64110306/colors=333,343,353,363,373,383,393,3a3/jpeg`

![/pxls/128/128/64110306/palette=333,343,353,363,373,383,393,3a3/jpeg](https://loremicon.com/pxls/128/128/64110306/palette=333,343,353,363,373,383,393,3a3/jpeg)<br>`/pxls/128/128/64110306/palette=333,343,353,363,373,383,393,3a3/jpeg`

![/grad/128/128/26798732/colors=lime;aqua;cornflowerblue;coral;hotpink/png](https://loremicon.com/grad/128/128/26798732/colors=lime;aqua;cornflowerblue;coral;hotpink/png)<br>`/grad/128/128/26798732/colors=lime;aqua;cornflowerblue;coral;hotpink/png`

![/pxls/128/128/26798732/colors=lime;aqua;cornflowerblue;coral;hotpink/png](https://loremicon.com/pxls/128/128/26798732/colors=lime;aqua;cornflowerblue;coral;hotpink/png)<br>`/pxls/128/128/26798732/colors=lime;aqua;cornflowerblue;coral;hotpink/png`

# Controlling the colors

In order to replace the randomly generated colors with a set
of pre-determined colors, you can specify either 
`colors=ccc,...` or `palette=ccc,...` as an additional path
segment before the format (which must always come last).

The difference between the two is how colors are selected:

* with `colors`, every time a color is needed, the next one from your list is used (and re-used, if more colors are 
  needed than were given)
* `palette` just provides a list to select from, and every use of a color chooses one at random -- which means that it 
   can use the same one every time, if that happens, maybe add another color to your list; this works because all 
   "randomness" derives from the seed in the URL and is the same every time you request an image using the same seed

![/poly/128/128/577251899890/colors=ccc,777/jpg](https://loremicon.com/poly/128/128/577251899890/colors=ccc,777/jpg)<br>`/poly/128/128/577251899890/colors=ccc,777/jpg`

![/poly/128/128/577251899890/palette=ccc,777/jpg](https://loremicon.com/poly/128/128/577251899890/palette=ccc,777/jpg)<br>`/poly/128/128/577251899890/palette=ccc,777/jpg`

![/ngon/128/128/264039499501/colors=ccc,777/jpg](https://loremicon.com/ngon/128/128/264039499501/colors=ccc,777/jpg)<br>`/ngon/128/128/264039499501/colors=ccc,777/jpg`

![/ngon/128/128/264039499501/palette=ccc,777/jpg](https://loremicon.com/ngon/128/128/264039499501/palette=ccc,777/jpg)<br>`/ngon/128/128/264039499501/palette=ccc,777/jpg`

![/poly/128/128/486310823847/colors=ccc,777/jpg](https://loremicon.com/poly/128/128/486310823847/colors=ccc,777/jpg)<br>`/poly/128/128/486310823847/colors=ccc,777/jpg`

![/poly/128/128/486310823847/palette=ccc,777/jpg](https://loremicon.com/poly/128/128/486310823847/palette=ccc,777/jpg)<br>`/poly/128/128/486310823847/palette=ccc,777/jpg`

![/rect/128/128/26798739/colors=f34,43f,567,3f4/png](https://loremicon.com/rect/128/128/26798739/colors=f34,43f,567,3f4/png)<br>`/rect/128/128/26798739/colors=f34,43f,567,3f4/png`

![/rect/128/128/26798739/palette=f34,43f,567,3f4/png](https://loremicon.com/rect/128/128/26798739/palette=f34,43f,567,3f4/png)<br>`/rect/128/128/26798739/palette=f34,43f,567,3f4/png`



# Building

Currently builds on macOS using node 13.

Docker image uses Alpine Linux and node 14.
