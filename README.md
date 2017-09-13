# mapstyler

## About
mapstyler is an app to help you quickly style a vector tile layer using an image. It was built using Esri's [dark gray canvas vector tile layer](https://www.arcgis.com/home/item.html?id=5ad3948260a147a993ef4865e3fad476), version 4 of the [ArcGIS API for JavaScript](https://developers.arcgis.com/javascript), [Color Thief](https://github.com/lokesh/color-thief), [RainbowVis-JS](https://github.com/anomal/RainbowVis-JS) and [Spectrum](https://bgrins.github.io/spectrum/).

Check out the app [here](http://esriuk.com/mapstyler).

## What's new in version 2.0?
- New design
- Modularised codebase
- Mobile version allowing you to take a picture for use to style the map
- Undo/redo stack
- Colour tweaking for maps styled using images

## Issues

Find a bug or want to request a new feature? Please let us know by submitting an issue.

## Grunt commands

### Requirements

* [nodejs](https://nodejs.org/en/)
* [gruntjs](https://gruntjs.com/)

### Installation

* clone this repo
* cd into the root dir of project
* run: npm install
* run: grunt watch

... now if you edit the .less files the Grunt Task Runner will watch for change and compile you nice new .css files.

## Licensing

Copyright 2017 ESRI (UK) Limited

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the Licence.
