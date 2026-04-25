const presetsProps = [
  " display: flex; flex-direction: row; align-items: center;  gap: 10px;",
  " display: flex; flex-direction: column; align-items: center;  gap: 10px;",
  " display: grid; grid-template-columns: repeat(auto-fill, minmax(250px,1fr)); align-items: center;  gap: 10px;",
  " display: grid; grid-template-columns: repeat(3, 1fr); align-items: center;  gap: 10px;",
] as const;

const commonProps1 = ["color: ", "background:", "!important",] as const;
const commonProps2 = [
  "width: 100%;",
  "height: 100%;",
  "width: 30px;",
  "height: 30px;",
  "min-width: 100px;",
  "max-width: 400px;",
  "max-width: calc(100vw - 20px);",
  "max-height: 100vh;",
  "min-height: 100vh;",
  "calc(100vw - 20px);",
] as const;
const commonProps3 = [
  "margin: 20px 0;",
  "padding: 20px 10px;",
  "margin: 0 auto;",

] as const;
const commonProps6 = [
  // Border
  "border: 1px solid #7AB764;",



  // Border-radius
  "border-radius: 10px;",
  "border-top-left-radius: 10px;",
  "border-top-right-radius: 10px;",
  "border-bottom-left-radius: 10px;",
  "border-bottom-right-radius: 10px;",
  // Outline
  "outline: 1px solid #4164ff;",
  // Cursor

] as const;
const commonProps7 = [
  "filter: blur(4px);",

  "box-shadow: inset 0 0 5px red;",
  "box-shadow: 0 0px 10px 0 rgba(40, 40, 40, 0.2);",
  "text-shadow: 0 0px 10px 0 rgba(40, 40, 40, 0.2);",
] as const;

const textProps = [
  // Font
  "font-size: 14px;",
  "font-weight: 700;",
  "line-height: 1;",
  "font-family: 'Nunito', sans-serif;",
  "font-style: italic;", // italian → italic

  // Color/Text

  "letter-spacing: .010rem;",
  "text-shadow: 0 0 5px red;",
  "text-transform: uppercase;",
  "text-align: center;",
  "white-space: nowrap;",
  "white-space: wrap;",

  // SVG
  "fill: white;",
  "stroke: white;",
] as const;


const positionProps = [
  // Position
  "position: relative;",
  "position: fixed;",
  "position: absolute;",

  // Edges
  "top: 0;",
  "left: 0;",
  "right: 0;",
  "bottom: 0;",

  // Center calc
  "left: calc((100vw - 1240px)/2);",
  // overflow
  "overflow: hidden;",
  "overflow: visible;",
  "overflow: scroll;",
  "overflow: auto;",
  "overflow-x: hidden;",
  "overflow-y: hidden;",

  "transform: translate(50%, 50%);",
  "transform: rotate(180deg) translateY(50%);",
  "transform: scale(1.1);",
  "transform: scaleX(1);",
  "transform: scaleY(1);",
  "transform: rotate3d(x,y,z,angle);",
  "transform-origin: top;",
  "transform: rotate3d(x,y,z,angle);",
  // Z-index
  "z-index: 5;",
  "transition: all 0.2s ease-in-out;",
  "cursor: pointer;"
] as const;


const displayOptions = [
  "block",
  "inline",
  "inline-block",
  "flex",
  "inline-flex",
  "grid",
  "inline-grid",
  "flow-root",
  "contents",
  "table",
  "table-row",
  "table-cell",
  "list-item",
  "none",
] as const;


const flexOptions = ["0 0 100%", "0 1 100%", "1 0 100%", "1 1 100%"] as const;

const flexDirectionOptions = [
  "column",
  "column-reverse",
  "row",
  "row-reverse",
  "0 0 100%",
  "0 1 100%",
  "1 0 100%",
  "1 1 100%",
] as const;

const flexWrapOptions = ["nowrap", "wrap", "wrap-reverse"] as const;

const justifyContentOptions = [
  "flex-start",
  "center",
  "flex-end",
  "space-between",
  "space-around",
  "space-evenly",
] as const;

const alignItemsOptions = [
  "stretch",
  "flex-start",
  "center",
  "flex-end",
  "baseline",
] as const;

const alignContentOptions = [
  "stretch",
  "flex-start",
  "center",
  "flex-end",
  "space-between",
  "space-around",
] as const;

const gapOptions = ["0", "4px", "8px", "12px", "16px", "24px"] as const;


const gridTemplateColumnsPresets = [
  "100px 1fr",
  "minmax(100px, 1fr)",
  "fit-content(40%)",
  "repeat(3, 200px)",
  "repeat(auto-fill, 300px)",
  "repeat(auto-fill, minmax(min(250px, 100%), 1fr))",
  "repeat(auto-fitt, minmax(min(250px, 100%), 1fr));",
] as const;

const gridTemplateColumnsSimple = [
  "repeat(2, 1fr)",
  "repeat(3, 1fr)",
  "repeat(4, 1fr)",
  "1fr 2fr",
  "2fr 1fr",
] as const;

const gridTemplateRowsOptions = [
  "repeat(2, 1fr)",
  "repeat(3, 1fr)",
  "auto 1fr auto",
] as const;

const gridAutoFlowOptions = [
  "row",
  "column", // авто создаёт колонки по контенту
  "row dense",
  "column dense",
] as const;

const gridAutoRowsOptions = [
  "auto",
  "max-content", // «прижимает» по высоте к контенту
  "min-content",
] as const;

const gridTemplateAreasOptions = [
  `"a b c e"
   "a d c e"`,
] as const;

const PropsNamen = {
  presetsProps,
  commonProps1,
  commonProps2,
  commonProps3,
  commonProps6,
  commonProps7,
  textProps,
  positionProps,
  displayOptions,
  flexOptions,
  flexDirectionOptions,
  flexWrapOptions,
  justifyContentOptions,
  alignItemsOptions,
  alignContentOptions,
  gapOptions,
  gridTemplateColumnsPresets,
  gridTemplateColumnsSimple,
  gridTemplateRowsOptions,
  gridAutoFlowOptions,
  gridAutoRowsOptions,
  gridTemplateAreasOptions,
}


export default PropsNamen
