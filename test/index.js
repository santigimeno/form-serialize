var assert = require('assert');
var domify = require('domify');

var serialize = require('../');

var hash_check = function(form, exp) {
    assert.deepEqual(serialize(form, { hash: true }), exp);
};

var str_check = function(form, exp) {
    assert.equal(serialize(form), exp);
};

test('nothing', function() {
    var form = domify('<form></form>');
    hash_check(form, {});
    str_check(form, '');
});

// basic form with single input
test('single element', function() {
    var form = domify('<form><input type="text" name="foo" value="bar"/></form>');
    hash_check(form, {
        'foo': 'bar'
    });
    str_check(form, 'foo=bar');
});

test('ignore no value', function() {
    var form = domify('<form><input type="text" name="foo"/></form>');
    hash_check(form, {});
    str_check(form, '');
});

test('multi inputs', function() {
    var form = domify('<form>' +
        '<input type="text" name="foo" value="bar 1"/>' +
        '<input type="text" name="foo.bar" value="bar 2"/>' +
        '<input type="text" name="baz.foo" value="bar 3"/>' +
        '</form>');
    hash_check(form, {
        'foo': 'bar 1',
        'foo.bar': 'bar 2',
        'baz.foo': 'bar 3'
    });
    str_check(form, 'foo=bar+1&foo.bar=bar+2&baz.foo=bar+3');
});

test('ignore disabled', function() {
    var form = domify('<form>' +
        '<input type="text" name="foo" value="bar 1"/>' +
        '<input type="text" name="foo.bar" value="bar 2" disabled/>' +
        '</form>');
    hash_check(form, {
        'foo': 'bar 1'
    });
    str_check(form, 'foo=bar+1');
});

test('ignore buttons', function() {
    var form = domify('<form>' +
        '<input type="submit" name="foo" value="submit"/>' +
        '<input type="reset" name="foo.bar" value="reset"/>' +
        '</form>');
    hash_check(form, {});
    str_check(form, '');
});

test('checkboxes', function() {
    var form = domify('<form>' +
        '<input type="checkbox" name="foo" checked/>' +
        '<input type="checkbox" name="bar"/>' +
        '<input type="checkbox" name="baz" checked/>' +
        '</form>');
    hash_check(form, {
        'foo': "on",
        'baz': "on"
    });
    str_check(form, 'foo=on&baz=on');
});

test('select - single', function() {
    var form = domify('<form>' +
        '<select name="foo">' +
        '<option value="bar">bar</option>' +
        '<option value="baz" selected>baz</option>' +
        '</select>' +
        '</form>');
    hash_check(form, {
        'foo': 'baz'
    });
    str_check(form, 'foo=baz');
});

test('select - multiple', function() {
    var form = domify('<form>' +
        '<select name="foo" multiple>' +
        '<option value="bar" selected>bar</option>' +
        '<option value="baz">baz</option>' +
        '<option value="cat" selected>cat</option>' +
        '</select>' +
        '</form>');
    hash_check(form, {
        'foo': ['bar', 'cat']
    });
    str_check(form, 'foo=bar&foo=cat');
});