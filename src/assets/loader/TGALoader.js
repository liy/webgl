/*
 * Copyright (c) 2012 Brandon Jones
 *
 * This software is provided 'as-is', without any express or implied
 * warranty. In no event will the authors be held liable for any damages
 * arising from the use of this software.
 *
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *
 *    1. The origin of this software must not be misrepresented; you must not
 *    claim that you wrote the original software. If you use this software
 *    in a product, an acknowledgment in the product documentation would be
 *    appreciated but is not required.
 *
 *    2. Altered source versions must be plainly marked as such, and must not
 *    be misrepresented as being the original software.
 *
 *    3. This notice may not be removed or altered from any source
 *    distribution.
 */
define(function(require){

"use strict"
var TGALoader = function(url){
  this.url = url;
  this.data = null;
  this.width = NaN;
  this.height = NaN;

  this.ready = get(url, "arraybuffer").then(this.decodeTGA.bind(this));
}
var p = TGALoader.prototype;

p.decodeTGA = function(arrayBuffer){
  var content = new Uint8Array(arrayBuffer),
      contentOffset = 18 + content[0],
      imagetype = content[2], // 2 = rgb, only supported format for now
      width = content[12] + (content[13] << 8),
      height = content[14] + (content[15] << 8),
      bpp = content[16], // should be 8,16,24,32

      bytesPerPixel = bpp / 8,
      bytesPerRow = width * 4,
      data, i, j, x, y;

  if(!width || !height)
    throw "Invalid dimensions";

  if (imagetype != 2)
    throw "Unsupported TGA format:" + imagetype;

  data = new Uint8Array(width * height * 4);
  i = contentOffset;

  for(y = height-1; y >= 0; --y) {
    for(x = 0; x < width; ++x, i += bytesPerPixel) {
      j = (x * 4) + (y * bytesPerRow);
      data[j] = content[i+2];
      data[j+1] = content[i+1];
      data[j+2] = content[i+0];
      data[j+3] = (bpp === 32 ? content[i+3] : 255);
    }
  }

  this.data = data;
  this.width = width;
  this.height = height;

  return this;
}

return TGALoader;

});