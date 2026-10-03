// Browser-independent game rules. Distances use a fixed logical 800 x 260 field.
export const GROUND = 210;
export const STUDENT_X = 90;
export type Obstacle = { x: number; width: number; height: number };
export type Point = { x: number; y: number; collected: boolean };
export type Run = {
  y: number;
  velocity: number;
  distance: number;
  gpa: number;
  speed: number;
  obstacles: Obstacle[];
  points: Point[];
  nextSpawn: number;
  over: boolean;
};
export const newRun = (): Run => ({
  y: 0,
  velocity: 0,
  distance: 0,
  gpa: 0,
  speed: 230,
  obstacles: [],
  points: [],
  nextSpawn: 1.6,
  over: false,
});
export function jump(run: Run) {
  if (!run.over && run.y === 0) run.velocity = 510;
}
export function step(run: Run, seconds: number, random = Math.random) {
  if (run.over) return;
  const dt = Math.max(0, Math.min(seconds, 1 / 30));
  run.velocity -= 1300 * dt;
  run.y = Math.max(0, run.y + run.velocity * dt);
  if (run.y === 0) run.velocity = 0;
  run.speed = Math.min(340, 230 + run.distance / 180);
  const dx = run.speed * dt;
  run.distance += dx;
  run.nextSpawn -= dt;
  if (run.nextSpawn <= 0) {
    const height = [30, 46, 62][Math.floor(random() * 3)];
    run.obstacles.push({ x: 840, width: height === 62 ? 34 : 44, height });
    run.points.push({ x: 860, y: GROUND - height - 38, collected: false });
    // At least 1.5 seconds between buildings, longer than a complete jump.
    run.nextSpawn = 1.5 + random() * 0.7;
  }
  for (const obstacle of run.obstacles) {
    obstacle.x -= dx;
    if (obstacle.x < STUDENT_X + 23 && obstacle.x + obstacle.width > STUDENT_X + 5 && run.y < obstacle.height - 4)
      run.over = true;
  }
  for (const point of run.points) {
    point.x -= dx;
    const studentCenterY = GROUND - run.y - 23;
    if (!point.collected && Math.abs(point.x - (STUDENT_X + 15)) < 27 && Math.abs(point.y - studentCenterY) < 34) {
      point.collected = true;
      run.gpa += 1;
    }
  }
  run.obstacles = run.obstacles.filter((item) => item.x > -60);
  run.points = run.points.filter((item) => item.x > -30 && !item.collected);
}
