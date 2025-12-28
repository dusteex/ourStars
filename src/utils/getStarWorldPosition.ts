import { Vector3, Matrix4 } from 'three';
import { WORLD_CENTER } from '../data/mockData';

/**
 * Преобразует локальные координаты звезд в абсолютные,
 * чтобы плоскость созвездия была перпендикулярна вектору от камеры к центру созвездия
 *
 * @param localPosition - Локальные координаты звезды относительно центра созвездия [x, y, z]
 * @param constellationCenter - Центр созвездия в мировых координатах [x, y, z]
 * @param cameraPosition - Позиция камеры в мировых координатах [x, y, z]
 * @returns Абсолютные координаты звезды в мировом пространстве [x, y, z]
 */
export function getStarWorldPosition(
  localPosition: [number, number, number],
  constellationCenter: [number, y: number, z: number],
): [number, number, number] {

  const cameraPosition = WORLD_CENTER

  // 1. Определяем вектор от камеры к центру созвездия
  const cameraToCenter = new Vector3(
    cameraPosition[0] - constellationCenter[0],
    cameraPosition[1] - constellationCenter[1],
    cameraPosition[2] - constellationCenter[2],
  ).normalize();

  // 2. Это будет нормаль к плоскости созвездия
  const planeNormal = cameraToCenter.clone();

  // 3. Нужно найти базис для плоскости (два ортогональных вектора в плоскости)
  // Используем вектор "вверх" как начальное направление
  let upVector = new Vector3(0, 1, 0);

  // Если нормаль почти вертикальна, используем другой вектор
  if (Math.abs(planeNormal.dot(upVector)) > 0.99) {
    upVector = new Vector3(1, 0, 0);
  }

  // 4. Первый базисный вектор в плоскости (перпендикулярен нормали)
  const axisX = new Vector3()
    .crossVectors(upVector, planeNormal)
    .normalize();

  // 5. Второй базисный вектор в плоскости (перпендикулярен нормали и axisX)
  const axisY = new Vector3()
    .crossVectors(planeNormal, axisX)
    .normalize();

  // 6. Создаем матрицу преобразования
  const transformMatrix = new Matrix4();

  // Задаем ориентацию плоскости
  transformMatrix.set(
    axisX.x, axisY.x, planeNormal.x, constellationCenter[0],
    axisX.y, axisY.y, planeNormal.y, constellationCenter[1],
    axisX.z, axisY.z, planeNormal.z, constellationCenter[2],
    0, 0, 0, 1
  );

  // 7. Преобразуем локальные координаты
  const localVector = new Vector3(...localPosition);
  const worldVector = localVector.applyMatrix4(transformMatrix);

  return [worldVector.x, worldVector.y, worldVector.z];
}