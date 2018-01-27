/* global $ */
'use strict';

const api = (function () {

  const search = function(query, callback) {
    $.ajax({
      type: 'GET',
      url: '/v1/notes/',
      dataType: 'json',
      data: query,
      success: callback
    });
  };

  const details = function(id, callback) {
    $.ajax({
      type: 'GET',
      dataType: 'json',
      url: `/v1/notes/${id}`,
      success: callback
    });
  };

  return {
    search,
    details
  };
  
}());