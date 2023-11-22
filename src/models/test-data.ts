import { Rule } from "./rule";

export const klasses = [
  {
    "name": "LandVehicle",
    "objectProperties": [],
    "datatypeProperties": []
  },
  {
    "name": "Distance",
    "objectProperties": [
      {
        "name": "to",
        "type": {
          "type": "class",
          "value": "SolidStructureOrObject"
        }
      }
    ],
    "datatypeProperties": [
      {
        "name": "distanceValue",
        "type": {
          "type": "primitive",
          "value": "float"
        }
      }
    ]
  },
  {
    "name": "DriverlessIndustrialTruck",
    "objectProperties": [
      {
        "name": "hasFuntion",
        "type": {
          "type": "class",
          "value": "AutomaticRestart"
        }
      },
      {
        "name": "hasFuntion",
        "type": {
          "type": "class",
          "value": "PersonRecognition"
        }
      },
      {
        "name": "hasFuntion",
        "type": {
          "type": "class",
          "value": "StopFunction"
        }
      },
      {
        "name": "hasWarning",
        "type": {
          "type": "or",
          "value": [
            {},
            {}
          ]
        }
      },
      {
        "name": "has",
        "type": {
          "type": "class",
          "value": "Distance"
        }
      }
    ],
    "datatypeProperties": [
      {
        "name": "distanceFront",
        "type": {
          "type": "primitive",
          "value": "float"
        }
      },
      {
        "name": "distanceToTheLeft",
        "type": {
          "type": "primitive",
          "value": "float"
        }
      },
      {
        "name": "distanceToTheRight",
        "type": {
          "type": "primitive",
          "value": "float"
        }
      },
      {
        "name": "hasMaxSpeed",
        "type": {
          "type": "primitive",
          "value": "float"
        }
      }
    ]
  },
  {
    "name": "AutomaticRestart",
    "objectProperties": [
      {
        "name": "isPartOf",
        "type": {
          "type": "class",
          "value": "DriverlessIndustrialTruck"
        }
      }
    ],
    "datatypeProperties": [
      {
        "name": "isAllowed",
        "type": {
          "type": "primitive",
          "value": "bool"
        }
      }
    ]
  },
  {
    "name": "AcousticalWarnings",
    "objectProperties": [
      {
        "name": "isPartOf",
        "type": {
          "type": "class",
          "value": "DriverlessIndustrialTruck"
        }
      }
    ],
    "datatypeProperties": [
      {
        "name": "isActivatedAW",
        "type": {
          "type": "primitive",
          "value": "bool"
        }
      }
    ]
  },
  {
    "name": "Warnings",
    "objectProperties": [],
    "datatypeProperties": []
  },
  {
    "name": "Functions",
    "objectProperties": [],
    "datatypeProperties": []
  },
  {
    "name": "SolidStructureOrObject",
    "objectProperties": [],
    "datatypeProperties": []
  },
  {
    "name": "PersonRecognition",
    "objectProperties": [
      {
        "name": "isPartOf",
        "type": {
          "type": "class",
          "value": "DriverlessIndustrialTruck"
        }
      }
    ],
    "datatypeProperties": [
      {
        "name": "isActivated",
        "type": {
          "type": "primitive",
          "value": "bool"
        }
      }
    ]
  },
  {
    "name": "StopFunction",
    "objectProperties": [
      {
        "name": "isPartOf",
        "type": {
          "type": "class",
          "value": "DriverlessIndustrialTruck"
        }
      }
    ],
    "datatypeProperties": [
      {
        "name": "isActivated",
        "type": {
          "type": "primitive",
          "value": "bool"
        }
      },
      {
        "name": "hasRange",
        "type": {
          "type": "value",
          "value": 600
        }
      }
    ]
  },
  {
    "name": "OpticalWarnings",
    "objectProperties": [
      {
        "name": "isPartOf",
        "type": {
          "type": "class",
          "value": "DriverlessIndustrialTruck"
        }
      }
    ],
    "datatypeProperties": [
      {
        "name": "isActivatedOW",
        "type": {
          "type": "primitive",
          "value": "bool"
        }
      }
    ]
  }
];

export const rules: Rule[] = [
  {
    "name": "Warning Failure",
    "enabled": true,
    "clauses": [
      {
        "type": "class",
        "name": "DriverlessIndustrialTruck",
        "args": [
          {
            "variable": "t"
          }
        ]
      },
      {
        "type": "datavalue",
        "name": "distanceFront",
        "args": [
          {
            "variable": "t"
          },
          {
            "variable": "df"
          }
        ]
      },
      {
        "type": "builtin",
        "name": "lessThan",
        "args": [
          {
            "variable": "df"
          },
          500
        ]
      },
      {
        "type": "datavalue",
        "name": "distanceToTheLeft",
        "args": [
          {
            "variable": "t"
          },
          {
            "variable": "dl"
          }
        ]
      },
      {
        "type": "builtin",
        "name": "greaterThan",
        "args": [
          {
            "variable": "dl"
          },
          500
        ]
      },
      {
        "type": "datavalue",
        "name": "distanceToTheRight",
        "args": [
          {
            "variable": "t"
          },
          {
            "variable": "dr"
          }
        ]
      },
      {
        "type": "builtin",
        "name": "greaterThan",
        "args": [
          {
            "variable": "dr"
          },
          500
        ]
      },
      {
        "type": "property",
        "name": "hasFuntion",
        "args": [
          {
            "variable": "t"
          },
          {
            "variable": "pf"
          }
        ]
      },
      {
        "type": "class",
        "name": "PersonRecognition",
        "args": [
          {
            "variable": "pf"
          }
        ]
      },
      {
        "type": "datavalue",
        "name": "isActivated",
        "args": [
          {
            "variable": "f"
          },
          {
            "variable": "isact"
          }
        ]
      },
      {
        "type": "builtin",
        "name": "equal",
        "args": [
          {
            "variable": "isact"
          },
          true
        ]
      },
      {
        "type": "property",
        "name": "hasWarning",
        "args": [
          {
            "variable": "t"
          },
          {
            "variable": "aw"
          }
        ]
      },
      {
        "type": "property",
        "name": "hasWarning",
        "args": [
          {
            "variable": "t"
          },
          {
            "variable": "ow"
          }
        ]
      },
      {
        "type": "class",
        "name": "AcousticalWarnings",
        "args": [
          {
            "variable": "aw"
          }
        ]
      },
      {
        "type": "class",
        "name": "OpticalWarnings",
        "args": [
          {
            "variable": "ow"
          }
        ]
      },
      {
        "type": "datavalue",
        "name": "isActivatedAW",
        "args": [
          {
            "variable": "aw"
          },
          false
        ]
      },
      {
        "type": "datavalue",
        "name": "isActivatedOW",
        "args": [
          {
            "variable": "ow"
          },
          false
        ]
      }
    ]
  },
  {
    "name": "max. Speed Definition",
    "enabled": true,
    "clauses": [
      {
        "type": "class",
        "name": "DriverlessIndustrialTruck",
        "args": [
          {
            "variable": "t"
          }
        ]
      },
      {
        "type": "datavalue",
        "name": "distanceFront",
        "args": [
          {
            "variable": "t"
          },
          {
            "variable": "df"
          }
        ]
      },
      {
        "type": "builtin",
        "name": "lessThan",
        "args": [
          {
            "variable": "df"
          },
          500
        ]
      },
      {
        "type": "datavalue",
        "name": "distanceToTheLeft",
        "args": [
          {
            "variable": "t"
          },
          {
            "variable": "dl"
          }
        ]
      },
      {
        "type": "builtin",
        "name": "greaterThan",
        "args": [
          {
            "variable": "dl"
          },
          500
        ]
      },
      {
        "type": "datavalue",
        "name": "distanceToTheRight",
        "args": [
          {
            "variable": "t"
          },
          {
            "variable": "dr"
          }
        ]
      },
      {
        "type": "builtin",
        "name": "greaterThan",
        "args": [
          {
            "variable": "dr"
          },
          500
        ]
      },
      {
        "type": "property",
        "name": "hasFuntion",
        "args": [
          {
            "variable": "t"
          },
          {
            "variable": "f"
          }
        ]
      },
      {
        "type": "class",
        "name": "PersonRecognition",
        "args": [
          {
            "variable": "f"
          }
        ]
      },
      {
        "type": "datavalue",
        "name": "isActivated",
        "args": [
          {
            "variable": "f"
          },
          true
        ]
      }
    ]
  },
  {
    "name": "Speed Failure",
    "enabled": true,
    "clauses": [
      {
        "type": "class",
        "name": "DriverlessIndustrialTruck",
        "args": [
          {
            "variable": "t"
          }
        ]
      },
      {
        "type": "datavalue",
        "name": "distanceFront",
        "args": [
          {
            "variable": "t"
          },
          {
            "variable": "df"
          }
        ]
      },
      {
        "type": "builtin",
        "name": "lessThan",
        "args": [
          {
            "variable": "df"
          },
          500
        ]
      },
      {
        "type": "datavalue",
        "name": "distanceToTheLeft",
        "args": [
          {
            "variable": "t"
          },
          {
            "variable": "dl"
          }
        ]
      },
      {
        "type": "builtin",
        "name": "greaterThan",
        "args": [
          {
            "variable": "dl"
          },
          500
        ]
      },
      {
        "type": "datavalue",
        "name": "distanceToTheRight",
        "args": [
          {
            "variable": "t"
          },
          {
            "variable": "dr"
          }
        ]
      },
      {
        "type": "builtin",
        "name": "greaterThan",
        "args": [
          {
            "variable": "dr"
          },
          500
        ]
      },
      {
        "type": "property",
        "name": "hasFuntion",
        "args": [
          {
            "variable": "t"
          },
          {
            "variable": "f"
          }
        ]
      },
      {
        "type": "class",
        "name": "PersonRecognition",
        "args": [
          {
            "variable": "f"
          }
        ]
      },
      {
        "type": "datavalue",
        "name": "isActivated",
        "args": [
          {
            "variable": "f"
          },
          true
        ]
      },
      {
        "type": "datavalue",
        "name": "hasSpeed",
        "args": [
          {
            "variable": "t"
          },
          {
            "variable": "s"
          }
        ]
      },
      {
        "type": "datavalue",
        "name": "hasMaxSpeed",
        "args": [
          {
            "variable": "t"
          },
          {
            "variable": "ms"
          }
        ]
      },
      {
        "type": "builtin",
        "name": "greaterThan",
        "args": [
          {
            "variable": "s"
          },
          {
            "variable": "ms"
          }
        ]
      }
    ]
  }
];
