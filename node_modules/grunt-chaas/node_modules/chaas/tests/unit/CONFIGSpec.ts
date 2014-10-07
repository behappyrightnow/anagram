describe('angular.service(CONFIG)', function(){
  beforeEach(module('fitWiki'));

  var CONFIG;

  beforeEach(inject(function(_CONFIG_){
    CONFIG = _CONFIG_;
  }));

  it('should have a `path()` method that constructs paths', function(){
    expect(CONFIG.path).toBeDefined();

    expect(CONFIG.path('path', 'to', 'file')).toEqual('path/to/file');
  });
});
