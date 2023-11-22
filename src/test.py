a = [
    {
        "label": "Warning Failure",
        "enabled": True,
        "body": [
            {
                "type": "class",
                "name": "DriverlessIndustrialTruck",
                "args": [{"variable": "tRUCKMICHNICHTSLAKDJALSDKJ"}],
            },
            {
                "type": "datavalue",
                "name": "distanceFront",
                "args": [{"variable": "df"}],
            },
            {
                "type": "builtin",
                "name": "lessThan",
                "args": [{"variable": "df"}, "500"],
            },
            {
                "type": "datavalue",
                "name": "distanceToTheLeft",
                "args": [{"variable": "dl"}],
            },
            {
                "type": "builtin",
                "name": "greaterThan",
                "args": [{"variable": "dl"}, "500"],
            },
            {
                "type": "datavalue",
                "name": "distanceToTheRight",
                "args": [{"variable": "dr"}],
            },
            {
                "type": "builtin",
                "name": "greaterThan",
                "args": [{"variable": "dr"}, "500"],
            },
            {
                "type": "class",
                "name": "PersonRecognition",
                "args": [{"variable": "pf"}],
            },
            {
                "type": "class",
                "name": "AcousticalWarnings",
                "args": [{"variable": "aw"}],
            },
            {
                "type": "datavalue",
                "name": "isActivatedAW",
                "args": [{"variable": None}],
            },
            {
                "type": "builtin",
                "name": "exactly",
                "args": [{"variable": None}, "false"],
            },
            {"type": "class", "name": "OpticalWarnings", "args": [{"variable": "ow"}]},
            {
                "type": "datavalue",
                "name": "isActivatedOW",
                "args": [{"variable": None}],
            },
            {
                "type": "builtin",
                "name": "exactly",
                "args": [{"variable": None}, "false"],
            },
            {"type": "property", "name": "hasFuntion", "args": ["t", "pf"]},
            {"type": "property", "name": "hasWarning", "args": ["t", "aw"]},
            {"type": "property", "name": "hasWarning", "args": ["t", "ow"]},
        ],
        "head": [
            {
                "type": "datavalue",
                "name": "hasFailure",
                "args": [{"variable": "t"}, "Warning Failure"],
            }
        ],
    },
    {
        "label": "max. Speed Definition",
        "enabled": True,
        "body": [
            {
                "type": "class",
                "name": "DriverlessIndustrialTruck",
                "args": [{"variable": "t"}],
            },
            {
                "type": "datavalue",
                "name": "distanceFront",
                "args": [{"variable": "df"}],
            },
            {
                "type": "builtin",
                "name": "lessThan",
                "args": [{"variable": "df"}, "500"],
            },
            {
                "type": "datavalue",
                "name": "distanceToTheLeft",
                "args": [{"variable": "dl"}],
            },
            {
                "type": "builtin",
                "name": "greaterThan",
                "args": [{"variable": "dl"}, "500"],
            },
            {
                "type": "datavalue",
                "name": "distanceToTheRight",
                "args": [{"variable": "dr"}],
            },
            {
                "type": "builtin",
                "name": "greaterThan",
                "args": [{"variable": "dr"}, "500"],
            },
            {"type": "class", "name": "PersonRecognition", "args": [{"variable": "f"}]},
            {"type": "datavalue", "name": "isActivated", "args": [{"variable": None}]},
            {
                "type": "builtin",
                "name": "exactly",
                "args": [{"variable": None}, "true"],
            },
            {"type": "property", "name": "hasFuntion", "args": ["t", "f"]},
        ],
        "head": [
            {
                "type": "datavalue",
                "name": "hasMaxSpeed",
                "args": [{"variable": "t"}, 0.7],
            }
        ],
    },
    {
        "label": "Speed Failure",
        "enabled": True,
        "body": [
            {
                "type": "class",
                "name": "DriverlessIndustrialTruck",
                "args": [{"variable": "t"}],
            },
            {
                "type": "datavalue",
                "name": "distanceFront",
                "args": [{"variable": "df"}],
            },
            {
                "type": "builtin",
                "name": "lessThan",
                "args": [{"variable": "df"}, "500"],
            },
            {
                "type": "datavalue",
                "name": "distanceToTheLeft",
                "args": [{"variable": "dl"}],
            },
            {
                "type": "builtin",
                "name": "greaterThan",
                "args": [{"variable": "dl"}, "500"],
            },
            {
                "type": "datavalue",
                "name": "distanceToTheRight",
                "args": [{"variable": "dr"}],
            },
            {
                "type": "builtin",
                "name": "greaterThan",
                "args": [{"variable": "dr"}, "500"],
            },
            {"type": "datavalue", "name": "hasSpeed", "args": [{"variable": "s"}]},
            {
                "type": "builtin",
                "name": "greaterThan",
                "args": [{"variable": "s"}, "?ms"],
            },
            {"type": "datavalue", "name": "hasMaxSpeed", "args": [{"variable": "ms"}]},
            {"type": "class", "name": "PersonRecognition", "args": [{"variable": "f"}]},
            {"type": "datavalue", "name": "isActivated", "args": [{"variable": None}]},
            {
                "type": "builtin",
                "name": "exactly",
                "args": [{"variable": None}, "true"],
            },
            {"type": "property", "name": "hasFuntion", "args": ["t", "f"]},
        ],
        "head": [
            {
                "type": "datavalue",
                "name": "hasFailure",
                "args": [{"variable": "t"}, "Speed Failure"],
            }
        ],
    },
]
