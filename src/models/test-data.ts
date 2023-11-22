import { Rule } from "./rule";

export const klasses = [
  {
    "name": "LandVehicle",
    "objectProperties": [],
    "datatypeProperties": []
  },
  {
    "name": "Distance",
    "objectProperties": [],
    "datatypeProperties": []
  },
  {
    "name": "DriverlessIndustrialTruck",
    "objectProperties": [
      {
        "name": "hasFuntion",
        "type": "Personrec"
      },
      {
        "name": "hasFuntion",
        "type": "Personrec"
      },
      {
        "name": "hasFuntion",
        "type": "Personrec"
      }
    ],
    "datatypeProperties": [
      {
        "name": "distanceFront",
        "type": "float"
      },
      {
        "name": "distanceToTheLeft",
        "type": "float"
      },
      {
        "name": "distanceToTheRight",
        "type": "float"
      }
    ]
  },
  {
    "name": "AutomaticRestart",
    "objectProperties": [],
    "datatypeProperties": []
  },
  {
    "name": "AcousticalWarnings",
    "objectProperties": [],
    "datatypeProperties": [
      {
        "name": "isActivatedAW",
        "type": "bool"
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
    "objectProperties": [],
    "datatypeProperties": [
      {
        "name": "isActivated",
        "type": "bool"
      }
    ]
  },
  {
    "name": "StopFunction",
    "objectProperties": [],
    "datatypeProperties": [
      {
        "name": "isActivated",
        "type": "bool"
      }
    ]
  },
  {
    "name": "OpticalWarnings",
    "objectProperties": [],
    "datatypeProperties": []
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
