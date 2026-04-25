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
  "display: block;",
  "display: inline;",
  "display: inline-block;",
  "display: flex;",
  "display: inline-flex;",
  "display: grid;",
  "display: inline-grid;",
  "display: flow-root;",
  "display: contents;",
  "display: table;",
  "display: table-row;",
  "display: table-cell;",
  "display: list-item;",
  "display: none;",
] as const;


const flexOptions = ["flex: 0 0 100%;", "flex: 0 1 100%;", "flex: 1 0 100%;", "flex: 1 1 100%;"] as const;

const flexDirectionOptions = [
  "flex-direction: column;",
  "flex-direction: column-reverse;",
  "flex-direction: row;",
  "flex-direction: row-reverse;",
] as const;

const flexWrapOptions = ["flex-wrap: nowrap;", "flex-wrap: wrap;", "flex-wrap: wrap-reverse;"] as const;

const justifyContentOptions = [
  "justify-content: flex-start;",
  "justify-content: center;",
  "justify-content: flex-end;",
  "justify-content: space-between;",
  "justify-content: space-around;",
  "justify-content: space-evenly;",
] as const;

const alignItemsOptions = [
  "align-items: stretch;",
  "align-items: flex-start;",
  "align-items: center;",
  "align-items: flex-end;",
  "align-items: baseline;",
] as const;

const alignContentOptions = [
  "align-content: stretch;",
  "align-content: flex-start;",
  "align-content: center;",
  "align-content: flex-end;",
  "align-content: space-between;",
  "align-content: space-around;",
] as const;

const gapOptions = ["gap: 0;", "gap: 4px;", "gap: 8px;", "gap: 12px;", "gap: 16px;", "gap: 24px;"] as const;


const gridTemplateColumnsPresets = [
  "grid-template-columns: 100px 1fr;",
  "grid-template-columns: minmax(100px, 1fr);",
  "grid-template-columns: fit-content(40%);",
  "grid-template-columns: repeat(3, 200px);",
  "grid-template-columns: repeat(auto-fill, 300px);",
  "grid-template-columns: repeat(auto-fill, minmax(min(250px, 100%), 1fr));",
  "grid-template-columns: repeat(auto-fitt, minmax(min(250px, 100%), 1fr));",
] as const;

const gridTemplateColumnsSimple = [
  "grid-template-columns: repeat(2, 1fr);",
  "grid-template-columns: repeat(3, 1fr);",
  "grid-template-columns: repeat(4, 1fr);",
  "grid-template-columns: 1fr 2fr;",
  "grid-template-columns: 2fr 1fr;",
] as const;

const gridTemplateRowsOptions = [
  "grid-template-rows: repeat(2, 1fr);",
  "grid-template-rows: repeat(3, 1fr);",
  "grid-template-rows: auto 1fr auto;",
] as const;

const gridAutoFlowOptions = [
  "grid-auto-flow: row;",
  "grid-auto-flow: column;", // авто создаёт колонки по контенту
  "grid-auto-flow: row dense;",
  "grid-auto-flow: column dense;",
] as const;

const gridAutoRowsOptions = [
  "grid-auto-rows: auto;",
  "grid-auto-rows: max-content;", // «прижимает» по высоте к контенту
  "grid-auto-rows: min-content;",
] as const;

const gridTemplateAreasOptions = [
  'grid-template-areas: "a b c e" \n "a d c e";',
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
