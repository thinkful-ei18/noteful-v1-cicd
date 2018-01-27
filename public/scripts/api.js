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

  const update = function(id, obj, callback) {
    $.ajax({
      type: 'PUT',
      url: `/v1/notes/${id}`,
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify(obj),
      success: callback
    });
  };

  return {
    search,
    details,
    update
  };
  
}());