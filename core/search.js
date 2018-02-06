/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Library for searching the Scratch Blocks workspace.
 * @author quacht@mit.edu (Tina Quach)
 */
'use strict';

goog.provide('Blockly.Search');
goog.require('goog.string');


// Recursively searches the block for relevant/possible search terms.
Blockly.Search.getBlockText = function(block) {
  var blockTextSources = [block].concat(block.getChildren());
  var blockText = '';
  blockTextSources.forEach(function(block) {
    blockText += ' ' + block.type;
    for (var i = 0, input; input = block.inputList[i]; i++) {
      if (typeof input.name != 'undefined') {
        blockText += ' ' + input.name.toLowerCase();
      }

      for (var j = 0, field; field = input.fieldRow[j]; j++) {
        if (typeof field.name != 'undefined') {
          blockText += ' ' + field.name.toLowerCase();
          // Add all dropdown options to the block text.
          if (field.argType_ == 'dropdown') {
            try {
              blockText += ' ' + field.menuGenerator_.map(menuItem => menuItem[0]).join(' ');
            } catch(error) {
              console.log(error);
              console.log(block.id);
              console.log(field.menuGenerator_);
              console.log(typeof field.menuGenerator_);
            }
          }
        }
      blockText += ' ' + field.getText().toLowerCase();
      }
    }         
  });
  return blockText;
};

// looks at the id of the block, and the text on the block.
Blockly.Search.isMatch = function(block, searchTerms) {
  var blockText = Blockly.Search.getBlockText(block);

  for (var i = 0; i < searchTerms.length; i++) {
    if (!blockText.includes(searchTerms[i])) {
      return false;
    }
  }
  return true;
};

Blockly.Search.getMatchingBlocks = function(query) {
  var search_terms = query.trim().toLowerCase().split(' ');
  var allBlocks = Blockly.mainWorkspace.getFlyout().getWorkspace().getTopBlocks();
  var matchingBlocks = []
  if (search_terms.length) {
    for (var i = 0; i < allBlocks.length; i++) {
      if (Blockly.Search.isMatch(allBlocks[i], search_terms)) {
        var xml = Blockly.Xml.blockToDom(allBlocks[i]);
        matchingBlocks.push(xml);
      }
    }
  }
  return matchingBlocks;
};

Blockly.Search.onSearch = function() {
  // Pull query from the search input.
  var query = document.getElementById("blockSearchInput").value;
  if (query) {
    // Update workspace showing search results
    var matchingBlocksList = Blockly.Search.getMatchingBlocks(query);
    Blockly.mainWorkspace.clear();
    if (matchingBlocksList.length) {
      var parentXml = document.createElement('xml');
      for (var i = 0; i < matchingBlocksList.length; i++) {
        parentXml.append(matchingBlocksList[i]);
      }
      Blockly.Xml.domToWorkspace(parentXml, Blockly.mainWorkspace);
      Blockly.mainWorkspace.cleanUp();
    } else {
      console.log('No matches found!');
    }
  } else {
    Blockly.mainWorkspace.clear();
  }
};

Blockly.Search.searchToolbox = function() {};

Blockly.Search.searchWorkspace = function() {};



