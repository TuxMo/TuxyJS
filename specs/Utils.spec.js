import U from '../lib/Utils';

describe('Utils', () => {
  describe('.getAllMembers', () => {
    it('is empty when the object has no members', () => {
      expect(U.getAllMembers({})).toEqual([]);
    });

    it('is the list of all members of an object', () => {
      const testObject = {
        aProperty: null,
        anotherProperty: null,
        aMethod: () => {
        }
      };
      expect(U.getAllMembers(testObject)).toEqual(['aMethod', 'aProperty', 'anotherProperty']);
    });

    it('includes inherited members of the object', () => {
      expect(U.getAllMembers(new TestChild())).toEqual([
        'childInstanceMethod',
        'childInstanceProperty',
        'grandParentInstanceMethod',
        'grandParentInstanceProperty',
        'parentInstanceMethod',
        'parentInstanceProperty',
      ]);
    });
  });

  describe('.getAllProperties', () => {
    it('is empty when the object has no members', () => {
      expect(U.getAllProperties({})).toEqual([]);
    });

    it('is empty when the object has no properties', () => {
      const testObject = {
        aMethod: () => {
        },
        anotherMethod() {
        }
      };
      expect(U.getAllProperties(testObject)).toEqual([]);
    });

    it('is the list of all properties on the object', () => {
      const testObject = {
        aProperty: null,
        anotherProperty: null,
        aMethod: () => {
        }
      };
      expect(U.getAllProperties(testObject)).toEqual(['aProperty', 'anotherProperty']);
    });

    it('includes inherited properties of the object', () => {
      expect(U.getAllProperties(new TestChild())).toEqual([
        'childInstanceProperty',
        'grandParentInstanceProperty',
        'parentInstanceProperty',
      ]);
    });
  });

  describe('.getAllFunctions', () => {
    it('is empty when the object has no members', () => {
      expect(U.getAllFunctions({})).toEqual([]);
    });

    it('is empty when the object has no functions', () => {
      const testObject = {
        aProperty: null,
        anotherProperty: null
      };
      expect(U.getAllFunctions(testObject)).toEqual([]);
    });

    it('compiles a list of all functions on an object', () => {
      const testObject = {
        aProperty: null,
        anotherProperty: null,
        aMethod() {
        },
        anotherMethod() {
        }
      };
      expect(U.getAllFunctions(testObject)).toEqual(['aMethod', 'anotherMethod']);
    });

    it('includes inherited functions of the object', () => {
      expect(U.getAllFunctions(new TestChild())).toEqual([
        'childInstanceMethod',
        'grandParentInstanceMethod',
        'parentInstanceMethod'
      ]);
    });
  });
});

class TestGrandParent {
  static grandParentStaticProperty = 42;
  grandParentInstanceProperty = 42;

  static grandParentStaticMethod() {
  }

  grandParentInstanceMethod() {
  }
}

class TestParent extends TestGrandParent {
  static parentStaticProperty = 42;
  parentInstanceProperty = 42;

  static parentStaticMethod() {
  }

  parentInstanceMethod() {
  }
}

class TestChild extends TestParent {
  static childStaticProperty = 42;
  childInstanceProperty = 42;

  static childStaticMethod() {
  }

  childInstanceMethod() {
  }
}
