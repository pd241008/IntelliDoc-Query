/**
 * Fake Celery Task Dispatcher Stub
 *
 * Immediately resolves tasks and optionally updates the mock Redis
 * store to simulate task completion, matching the real Celery
 * result-backend pattern.
 */

import { mockRedisClient } from "./redis";

interface TaskResult {
  taskId: string;
  status: "PENDING" | "STARTED" | "SUCCESS" | "FAILURE" | "RETRY";
  result: any;
}

const taskResults = new Map<string, TaskResult>();
let taskCounter = 0;

export const mockCeleryClient = {
  /**
   * Dispatch a task. Immediately resolves and stores the result
   * in both the internal task map and mock Redis (simulating
   * Celery's result backend).
   */
  sendTask: jest.fn(
    async (taskName: string, args: any[] = [], kwargs: Record<string, any> = {}): Promise<string> => {
      taskCounter += 1;
      const taskId = `mock-task-${taskCounter}`;

      const result: TaskResult = {
        taskId,
        status: "SUCCESS",
        result: {
          taskName,
          args,
          kwargs,
          completedAt: new Date().toISOString(),
        },
      };

      taskResults.set(taskId, result);

      // Mirror to Redis (simulates Celery result backend)
      await mockRedisClient.set(
        `celery-task-meta-${taskId}`,
        JSON.stringify(result),
      );

      return taskId;
    },
  ),

  /**
   * Retrieve a task result by ID.
   * Checks internal store first, then falls back to mock Redis.
   */
  getTaskResult: jest.fn(async (taskId: string): Promise<TaskResult | null> => {
    // Check in-memory store
    if (taskResults.has(taskId)) {
      return taskResults.get(taskId)!;
    }

    // Fallback: check Redis (matches real Celery behavior)
    const raw = await mockRedisClient.get(`celery-task-meta-${taskId}`);
    if (raw) {
      return JSON.parse(raw) as TaskResult;
    }

    return null;
  }),

  /**
   * Check if a task has completed.
   */
  isTaskComplete: jest.fn(async (taskId: string): Promise<boolean> => {
    const result = taskResults.get(taskId);
    return result?.status === "SUCCESS" || result?.status === "FAILURE";
  }),
};

/**
 * Reset the mock between tests.
 * Clears stored tasks AND resets jest call history.
 */
export function resetMockCelery(): void {
  taskResults.clear();
  taskCounter = 0;
  mockCeleryClient.sendTask.mockClear();
  mockCeleryClient.getTaskResult.mockClear();
  mockCeleryClient.isTaskComplete.mockClear();
}
