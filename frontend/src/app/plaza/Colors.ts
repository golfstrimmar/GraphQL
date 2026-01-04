type ColorGroup =
  | "neutral"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "cyan"
  | "blue"
  | "purple"
  | "brown";

type ColorItem = {
  color: string;
  value: string;
  group: ColorGroup;
};

export const Colors: ColorItem[] = [
  // neutrals
  { color: "white", value: "white", group: "neutral" },
  { color: "snow", value: "snow", group: "neutral" },
  { color: "whitesmoke", value: "whitesmoke", group: "neutral" },
  { color: "ghostwhite", value: "ghostwhite", group: "neutral" },
  { color: "floralwhite", value: "floralwhite", group: "neutral" },
  { color: "seashell", value: "seashell", group: "neutral" },
  { color: "ivory", value: "ivory", group: "neutral" },
  { color: "honeydew", value: "honeydew", group: "neutral" },
  { color: "mintcream", value: "mintcream", group: "neutral" },
  { color: "azure", value: "azure", group: "neutral" },
  { color: "aliceblue", value: "aliceblue", group: "neutral" },
  { color: "oldlace", value: "oldlace", group: "neutral" },
  { color: "linen", value: "linen", group: "neutral" },
  { color: "antiquewhite", value: "antiquewhite", group: "neutral" },
  { color: "beige", value: "beige", group: "neutral" },
  { color: "cornsilk", value: "cornsilk", group: "neutral" },
  { color: "gainsboro", value: "gainsboro", group: "neutral" },
  { color: "lightgray", value: "lightgray", group: "neutral" },
  { color: "lightgrey", value: "lightgrey", group: "neutral" },
  { color: "silver", value: "silver", group: "neutral" },
  { color: "darkgray", value: "darkgray", group: "neutral" },
  { color: "darkgrey", value: "darkgrey", group: "neutral" },
  { color: "gray", value: "gray", group: "neutral" },
  { color: "grey", value: "grey", group: "neutral" },
  { color: "dimgray", value: "dimgray", group: "neutral" },
  { color: "dimgrey", value: "dimgrey", group: "neutral" },
  { color: "slategray", value: "slategray", group: "neutral" },
  { color: "slategrey", value: "slategrey", group: "neutral" },
  { color: "darkslategray", value: "darkslategray", group: "neutral" },
  { color: "darkslategrey", value: "darkslategrey", group: "neutral" },
  { color: "black", value: "black", group: "neutral" },

  // reds
  { color: "mistyrose", value: "mistyrose", group: "red" },
  { color: "lavenderblush", value: "lavenderblush", group: "red" },
  { color: "pink", value: "pink", group: "red" },
  { color: "lightpink", value: "lightpink", group: "red" },
  { color: "hotpink", value: "hotpink", group: "red" },
  { color: "deeppink", value: "deeppink", group: "red" },
  { color: "palevioletred", value: "palevioletred", group: "red" },
  { color: "mediumvioletred", value: "mediumvioletred", group: "red" },
  { color: "lightcoral", value: "lightcoral", group: "red" },
  { color: "salmon", value: "salmon", group: "red" },
  { color: "darksalmon", value: "darksalmon", group: "red" },
  { color: "indianred", value: "indianred", group: "red" },
  { color: "rosybrown", value: "rosybrown", group: "red" },
  { color: "brown", value: "brown", group: "red" },
  { color: "firebrick", value: "firebrick", group: "red" },
  { color: "maroon", value: "maroon", group: "red" },
  { color: "red", value: "red", group: "red" },
  { color: "darkred", value: "darkred", group: "red" },
  { color: "crimson", value: "crimson", group: "red" },
  { color: "tomato", value: "tomato", group: "red" },

  // oranges
  { color: "peachpuff", value: "peachpuff", group: "orange" },
  { color: "moccasin", value: "moccasin", group: "orange" },
  { color: "papayawhip", value: "papayawhip", group: "orange" },
  { color: "blanchedalmond", value: "blanchedalmond", group: "orange" },
  { color: "bisque", value: "bisque", group: "orange" },
  { color: "navajowhite", value: "navajowhite", group: "orange" },
  { color: "wheat", value: "wheat", group: "orange" },
  { color: "burlywood", value: "burlywood", group: "orange" },
  { color: "tan", value: "tan", group: "orange" },
  { color: "sandybrown", value: "sandybrown", group: "orange" },
  { color: "darkorange", value: "darkorange", group: "orange" },
  { color: "orange", value: "orange", group: "orange" },
  { color: "peru", value: "peru", group: "orange" },
  { color: "chocolate", value: "chocolate", group: "orange" },
  { color: "sienna", value: "sienna", group: "orange" },

  // yellows
  { color: "khaki", value: "khaki", group: "yellow" },
  { color: "darkkhaki", value: "darkkhaki", group: "yellow" },
  { color: "gold", value: "gold", group: "yellow" },
  { color: "yellow", value: "yellow", group: "yellow" },
  { color: "lemonchiffon", value: "lemonchiffon", group: "yellow" },
  { color: "lightyellow", value: "lightyellow", group: "yellow" },
  {
    color: "lightgoldenrodyellow",
    value: "lightgoldenrodyellow",
    group: "yellow",
  },
  { color: "palegoldenrod", value: "palegoldenrod", group: "yellow" },

  // greens
  { color: "greenyellow", value: "greenyellow", group: "green" },
  { color: "chartreuse", value: "chartreuse", group: "green" },
  { color: "lawngreen", value: "lawngreen", group: "green" },
  { color: "palegreen", value: "palegreen", group: "green" },
  { color: "lightgreen", value: "lightgreen", group: "green" },
  { color: "springgreen", value: "springgreen", group: "green" },
  { color: "mediumspringgreen", value: "mediumspringgreen", group: "green" },
  { color: "lime", value: "lime", group: "green" },
  { color: "limegreen", value: "limegreen", group: "green" },
  { color: "yellowgreen", value: "yellowgreen", group: "green" },
  { color: "olivedrab", value: "olivedrab", group: "green" },
  { color: "olive", value: "olive", group: "green" },
  { color: "darkolivegreen", value: "darkolivegreen", group: "green" },
  { color: "forestgreen", value: "forestgreen", group: "green" },
  { color: "seagreen", value: "seagreen", group: "green" },
  { color: "mediumseagreen", value: "mediumseagreen", group: "green" },
  { color: "darkseagreen", value: "darkseagreen", group: "green" },
  { color: "green", value: "green", group: "green" },
  { color: "darkgreen", value: "darkgreen", group: "green" },

  // cyans
  { color: "aquamarine", value: "aquamarine", group: "cyan" },
  { color: "mediumaquamarine", value: "mediumaquamarine", group: "cyan" },
  { color: "turquoise", value: "turquoise", group: "cyan" },
  { color: "mediumturquoise", value: "mediumturquoise", group: "cyan" },
  { color: "paleturquoise", value: "paleturquoise", group: "cyan" },
  { color: "lightseagreen", value: "lightseagreen", group: "cyan" },
  { color: "darkcyan", value: "darkcyan", group: "cyan" },
  { color: "teal", value: "teal", group: "cyan" },
  { color: "aqua", value: "aqua", group: "cyan" },
  { color: "cyan", value: "cyan", group: "cyan" },
  { color: "darkturquoise", value: "darkturquoise", group: "cyan" },

  // blues
  { color: "lightcyan", value: "lightcyan", group: "blue" },
  { color: "powderblue", value: "powderblue", group: "blue" },
  { color: "lightblue", value: "lightblue", group: "blue" },
  { color: "lightskyblue", value: "lightskyblue", group: "blue" },
  { color: "skyblue", value: "skyblue", group: "blue" },
  { color: "deepskyblue", value: "deepskyblue", group: "blue" },
  { color: "lightsteelblue", value: "lightsteelblue", group: "blue" },
  { color: "steelblue", value: "steelblue", group: "blue" },
  { color: "cornflowerblue", value: "cornflowerblue", group: "blue" },
  { color: "dodgerblue", value: "dodgerblue", group: "blue" },
  { color: "royalblue", value: "royalblue", group: "blue" },
  { color: "slateblue", value: "slateblue", group: "blue" },
  { color: "mediumslateblue", value: "mediumslateblue", group: "blue" },
  { color: "mediumblue", value: "mediumblue", group: "blue" },
  { color: "blue", value: "blue", group: "blue" },
  { color: "darkblue", value: "darkblue", group: "blue" },
  { color: "midnightblue", value: "midnightblue", group: "blue" },
  { color: "navy", value: "navy", group: "blue" },

  // purples
  { color: "lavender", value: "lavender", group: "purple" },
  { color: "thistle", value: "thistle", group: "purple" },
  { color: "plum", value: "plum", group: "purple" },
  { color: "violet", value: "violet", group: "purple" },
  { color: "orchid", value: "orchid", group: "purple" },
  { color: "mediumorchid", value: "mediumorchid", group: "purple" },
  { color: "darkorchid", value: "darkorchid", group: "purple" },
  { color: "fuchsia", value: "fuchsia", group: "purple" },
  { color: "magenta", value: "magenta", group: "purple" },
  { color: "purple", value: "purple", group: "purple" },
  { color: "rebeccapurple", value: "rebeccapurple", group: "purple" },
  { color: "darkmagenta", value: "darkmagenta", group: "purple" },
  { color: "indigo", value: "indigo", group: "purple" },
];

export default Colors;
