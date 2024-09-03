export default {
  a: function (l, n) {
    return 'tmpl_' + l + '_' + n
  },
  b: function (a, b) {
    return a === undefined ? b : a
  },
  c: function(i, prefix) {
    var s = i.focus !== undefined ? 'focus' : 'blur'
    return prefix + i.nn + '_' + s
  },
  e: function (n) {
    return 'tmpl_' + n + '_container'
  },
  f: function (l) {
    return l.filter(function (i) {return i.nn === '51'})
  }
}