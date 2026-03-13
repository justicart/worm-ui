type ContourPathOptions = {
  width: number
  padding: number
  overshoot: number
  centerY: number
  crestHalfWidth: number
  crestHeight: number
  thumbX: number
}

export function createContourPath({
  width,
  padding,
  overshoot,
  centerY,
  crestHalfWidth,
  crestHeight,
  thumbX,
}: ContourPathOptions) {
  const shoulderControlOffset = crestHalfWidth * 0.6875
  const peakControlOffset = crestHalfWidth * 0.5

  return [
    `M ${padding - overshoot} ${centerY}`,
    `H ${thumbX - crestHalfWidth}`,
    `C ${thumbX - shoulderControlOffset} ${centerY} ${thumbX - peakControlOffset} ${centerY - crestHeight} ${thumbX} ${
      centerY - crestHeight
    }`,
    `C ${thumbX + peakControlOffset} ${centerY - crestHeight} ${thumbX + shoulderControlOffset} ${centerY} ${
      thumbX + crestHalfWidth
    } ${centerY}`,
    `H ${width - padding + overshoot}`,
  ].join(' ')
}
