
# Simple Lorem Icon service

- uses node-canvas
- simple frontend to try out the service is at /help-me/
- if you want really permanent permalinks to the images, 
  you should host this yourself somewhere

# Building

Currently builds on macOS using node 13.

Docker image uses Alpine Linux and node 14.



# Random examples

* !<https://loremicon.com/poly/128/128/577251899890/jpg>
* !<https://loremicon.com/ngon/128/128/264039499501/jpg>
* !<https://loremicon.com/poly/128/128/486310823847/jpg>

# Controlling the colors

In order to replace the randomly generated colors with a set
of pre-determined colors, you can specify either 
`colors=ccc,...` or `palette=ccc,...` as an additional path
segment before the format (which must always come last).

* `/poly/128/128/577251899890/colors=ccc,777/jpg` ![/poly/128/128/577251899890/colors=ccc,777/jpg](https://loremicon.com/poly/128/128/577251899890/colors=ccc,777/jpg)
* `/poly/128/128/577251899890/palette=ccc,777/jpg` ![/poly/128/128/577251899890/palette=ccc,777/jpg](https://loremicon.com/poly/128/128/577251899890/palette=ccc,777/jpg)
* `/ngon/128/128/264039499501/colors=ccc,777/jpg` ![/ngon/128/128/264039499501/colors=ccc,777/jpg](https://loremicon.com/ngon/128/128/264039499501/colors=ccc,777/jpg)
* `/ngon/128/128/264039499501/palette=ccc,777/jpg` ![/ngon/128/128/264039499501/palette=ccc,777/jpg](https://loremicon.com/ngon/128/128/264039499501/palette=ccc,777/jpg)
* `/poly/128/128/486310823847/colors=ccc,777/jpg` ![/poly/128/128/486310823847/colors=ccc,777/jpg](https://loremicon.com/poly/128/128/486310823847/colors=ccc,777/jpg)
* `/poly/128/128/486310823847/palette=ccc,777/jpg` ![/poly/128/128/486310823847/palette=ccc,777/jpg](https://loremicon.com/poly/128/128/486310823847/palette=ccc,777/jpg)
* `/rect/128/128/26798739/colors=f34,43f,567,3f4/png` ![/rect/128/128/26798739/colors=f34,43f,567,3f4/png](https://loremicon.com/rect/128/128/26798739/colors=f34,43f,567,3f4/png)
* `/rect/128/128/26798739/palette=f34,43f,567,3f4/png` ![/rect/128/128/26798739/palette=f34,43f,567,3f4/png](https://loremicon.com/rect/128/128/26798739/palette=f34,43f,567,3f4/png)

