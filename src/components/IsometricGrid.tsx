import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Polygon, G, Text as SvgText } from 'react-native-svg';
import { SIZES } from '../constants/theme';
import { BUILDINGS } from '../constants/buildings';
import { gridToScreen, tileDiamond, buildingPolygons } from '../utils/isoMath';
import { PlacedBuilding } from '../game/store';

const { gridCols, gridRows, tileW, tileH, buildingHeight } = SIZES;

const SVG_WIDTH = (gridCols + gridRows) * (tileW / 2);
const SVG_HEIGHT = (gridCols + gridRows) * (tileH / 2) + buildingHeight + 80;
const ORIGIN_X = SVG_WIDTH / 2;
const ORIGIN_Y = buildingHeight + 20;

interface Props {
  placedBuildings: PlacedBuilding[];
  selectedType: string | null;
  onTilePress: (col: number, row: number) => void;
  onBuildingPress: (id: string) => void;
}

export function IsometricGrid({
  placedBuildings,
  selectedType,
  onTilePress,
  onBuildingPress,
}: Props) {
  const buildingMap = useMemo(() => {
    const map = new Map<string, PlacedBuilding>();
    placedBuildings.forEach(b => map.set(`${b.col},${b.row}`, b));
    return map;
  }, [placedBuildings]);

  // Back-to-front painter's algorithm: sort by col + row ascending
  const tiles = useMemo(() => {
    const result: { col: number; row: number }[] = [];
    for (let diag = 0; diag < gridCols + gridRows - 1; diag++) {
      for (let col = 0; col <= diag; col++) {
        const row = diag - col;
        if (col < gridCols && row >= 0 && row < gridRows) {
          result.push({ col, row });
        }
      }
    }
    return result;
  }, []);

  return (
    <View>
      <Svg width={SVG_WIDTH} height={SVG_HEIGHT}>
        {tiles.map(({ col, row }) => {
          const { x, y } = gridToScreen(col, row, ORIGIN_X, ORIGIN_Y);
          const building = buildingMap.get(`${col},${row}`);

          const tileColor = building
            ? '#5c4030'
            : selectedType
              ? '#6a9a50'
              : '#8B7355';
          const tileColorRight = building ? '#3a2818' : selectedType ? '#406030' : '#6B5540';
          const tileColorLeft = building ? '#4a3020' : selectedType ? '#507040' : '#7a6348';

          return (
            <G key={`tile-${col}-${row}`}>
              {/* Ground tile diamond */}
              <Polygon
                points={tileDiamond(x, y)}
                fill={tileColor}
                stroke="#1a0a00"
                strokeWidth={0.8}
                onPress={() => !building && onTilePress(col, row)}
              />

              {/* 3-face isometric building box */}
              {building && (() => {
                const bh = buildingHeight + (building.level - 1) * 8;
                const { colors, emoji } = BUILDINGS[building.type];
                const polys = buildingPolygons(x, y, bh);
                return (
                  <G onPress={() => onBuildingPress(building.id)}>
                    <Polygon
                      points={polys.leftWall}
                      fill={colors.left}
                      stroke="#1a0a00"
                      strokeWidth={0.5}
                    />
                    <Polygon
                      points={polys.rightWall}
                      fill={colors.right}
                      stroke="#1a0a00"
                      strokeWidth={0.5}
                    />
                    <Polygon
                      points={polys.topFace}
                      fill={colors.top}
                      stroke="#1a0a00"
                      strokeWidth={0.5}
                    />
                    <SvgText
                      x={x}
                      y={y - bh + tileH / 2}
                      fontSize={14}
                      textAnchor="middle"
                      alignmentBaseline="middle"
                    >
                      {emoji}
                    </SvgText>
                    {building.level > 1 && (
                      <SvgText
                        x={x + tileW / 2 - 6}
                        y={y - bh}
                        fontSize={9}
                        fill="#ffffff"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {`L${building.level}`}
                      </SvgText>
                    )}
                  </G>
                );
              })()}
            </G>
          );
        })}
      </Svg>
    </View>
  );
}
