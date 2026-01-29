/**
 * Task Manager - In-Memory Storage
 * Stores task status and results during processing
 * 
 * Trade-off: Data is lost on server restart, but perfect for MVP/demo
 * Production: Would use Redis or PostgreSQL
 */

class TaskManager {
  constructor() {
    // Map to store all tasks: taskId -> task data
    this.tasks = new Map();
    this.MAX_TASKS = 1000; // Maximum tasks to keep in memory
  }

  /**
   * Create a new task with pending status
   * @param {string} taskId - Unique task identifier
   * @param {object} metadata - Initial task data (repo_url, pr_number)
   */
  createTask(taskId, metadata = {}) {
    // Check if we've hit the limit
    if (this.tasks.size >= this.MAX_TASKS) {
      this.cleanupOldTasks();

      // If still at max after cleanup, remove oldest
      if (this.tasks.size >= this.MAX_TASKS) {
        const oldestKey = this.tasks.keys().next().value;
        this.tasks.delete(oldestKey);
      }
    }

    this.tasks.set(taskId, {
      task_id: taskId,
      status: 'pending',
      created_at: new Date().toISOString(),
      ...metadata,
      results: null,
      error: null
    });
  }

  /**
   * Update task status (pending -> processing -> completed/failed)
   * @param {string} taskId 
   * @param {string} status - 'pending' | 'processing' | 'completed' | 'failed'
   */
  updateStatus(taskId, status) {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = status;
      task.updated_at = new Date().toISOString();
    }
  }

  /**
   * Store the final analysis results
   * @param {string} taskId 
   * @param {object} results - The AI analysis results
   */
  setResults(taskId, results) {
    const task = this.tasks.get(taskId);
    if (task) {
      task.results = results;
      task.status = 'completed';
      task.completed_at = new Date().toISOString();
    }
  }

  /**
   * Store error information if processing fails
   * @param {string} taskId 
   * @param {string} error - Error message
   */
  setError(taskId, error) {
    const task = this.tasks.get(taskId);
    if (task) {
      task.error = error;
      task.status = 'failed';
      task.failed_at = new Date().toISOString();
    }
  }

  /**
   * Get task by ID
   * @param {string} taskId 
   * @returns {object|null} Task data or null if not found
   */
  getTask(taskId) {
    return this.tasks.get(taskId) || null;
  }

  /**
   * Get only the status of a task (for /status endpoint)
   * @param {string} taskId 
   * @returns {object} Status object
   */
  getStatus(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) {
      return { error: 'Task not found' };
    }
    
    return {
      task_id: task.task_id,
      status: task.status,
      created_at: task.created_at,
      updated_at: task.updated_at
    };
  }

  /**
   * Get full results (for /results endpoint)
   * @param {string} taskId 
   * @returns {object} Full task data including results
   */
  getResults(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) {
      return { error: 'Task not found' };
    }

    if (task.status === 'pending' || task.status === 'processing') {
      return {
        task_id: task.task_id,
        status: task.status,
        message: 'Analysis still in progress. Please check back later.'
      };
    }

    if (task.status === 'failed') {
      return {
        task_id: task.task_id,
        status: 'failed',
        error: task.error
      };
    }

    return {
      task_id: task.task_id,
      status: task.status,
      results: task.results,
      completed_at: task.completed_at
    };
  }

  /**
   * Clean up old tasks (optional - for memory management)
   * Removes tasks older than 1 hour
   */
  cleanupOldTasks() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    for (const [taskId, task] of this.tasks.entries()) {
      const createdAt = new Date(task.created_at).getTime();
      if (createdAt < oneHourAgo) {
        this.tasks.delete(taskId);
      }
    }
  }
}

// Export a single instance (singleton pattern)
const taskManagerInstance = new TaskManager();

// Auto-cleanup old tasks every hour to prevent memory leak
setInterval(() => {
  taskManagerInstance.cleanupOldTasks();
}, 3600000); // Run every 1 hour

module.exports = taskManagerInstance;