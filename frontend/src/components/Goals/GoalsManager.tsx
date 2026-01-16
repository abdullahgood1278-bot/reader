import React, { useState, useEffect } from 'react';
import { Target, Plus, X, Edit2, Trash2, Calendar, CheckCircle, TrendingUp } from 'lucide-react';
import { statisticsAPI } from '../../services/api';
import type { ReadingGoal } from '../../types';

interface GoalsManagerProps {
  onClose: () => void;
}

interface GoalFormData {
  goal_type: 'words_per_day' | 'words_per_week' | 'books_per_month' | 'minutes_per_day';
  target_value: number;
  period: 'daily' | 'weekly' | 'monthly';
  start_date: string;
  end_date: string;
}

const GOAL_TYPES = {
  words_per_day: { label: 'Words per Day', unit: 'words' },
  words_per_week: { label: 'Words per Week', unit: 'words' },
  books_per_month: { label: 'Books per Month', unit: 'books' },
  minutes_per_day: { label: 'Minutes per Day', unit: 'minutes' }
};

const PERIODS = {
  daily: { label: 'Daily Goal', days: 1 },
  weekly: { label: 'Weekly Goal', days: 7 },
  monthly: { label: 'Monthly Goal', days: 30 }
};

export const GoalsManager: React.FC<GoalsManagerProps> = ({ onClose }) => {
  const [goals, setGoals] = useState<ReadingGoal[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<GoalFormData>({
    goal_type: 'words_per_day',
    target_value: 1000,
    period: 'daily',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const response = await statisticsAPI.getGoals();
      setGoals(response.data.goals || []);
    } catch (error) {
      console.error('Failed to load goals:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingId) {
        await statisticsAPI.updateGoal(editingId, formData);
      } else {
        await statisticsAPI.createGoal(formData);
      }
      
      setIsAdding(false);
      setEditingId(null);
      setFormData({
        goal_type: 'words_per_day',
        target_value: 1000,
        period: 'daily',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      loadGoals();
    } catch (error) {
      console.error('Failed to save goal:', error);
      alert('Failed to save goal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGoal = async (id: number) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      await statisticsAPI.deleteGoal(id);
      loadGoals();
    } catch (error) {
      console.error('Failed to delete goal:', error);
      alert('Failed to delete goal. Please try again.');
    }
  };

  const startEdit = (goal: ReadingGoal) => {
    setEditingId(goal.id);
    setFormData({
      goal_type: goal.goal_type as keyof typeof GOAL_TYPES,
      target_value: goal.target_value,
      period: goal.period as keyof typeof PERIODS,
      start_date: goal.start_date,
      end_date: goal.end_date
    });
    setIsAdding(true);
  };

  const cancelEdit = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      goal_type: 'words_per_day',
      target_value: 1000,
      period: 'daily',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  };

  const calculateProgress = (goal: ReadingGoal): number => {
    if (goal.target_value === 0) return 0;
    return Math.min((goal.current_value / goal.target_value) * 100, 100);
  };

  const getDaysRemaining = (endDate: string): number => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const isExpired = (endDate: string): boolean => {
    return new Date(endDate) < new Date();
  };

  const isCompleted = (goal: ReadingGoal): boolean => {
    return goal.current_value >= goal.target_value;
  };

  const formatValue = (value: number, type: string): string => {
    switch (type) {
      case 'words_per_day':
      case 'words_per_week':
        return value.toLocaleString() + ' words';
      case 'books_per_month':
        return value.toString() + ' book' + (value === 1 ? '' : 's');
      case 'minutes_per_day':
        return value + ' minutes';
      default:
        return value.toString();
    }
  };

  const getStatusColor = (goal: ReadingGoal): string => {
    if (isCompleted(goal)) return 'text-green-600';
    if (isExpired(goal.end_date)) return 'text-red-600';
    const progress = calculateProgress(goal);
    if (progress >= 75) return 'text-blue-600';
    if (progress >= 50) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getProgressColor = (goal: ReadingGoal): string => {
    if (isCompleted(goal)) return 'bg-green-500';
    if (isExpired(goal.end_date)) return 'bg-red-500';
    const progress = calculateProgress(goal);
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Target className="text-blue-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reading Goals</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6">
            {/* Add Goal Form */}
            {isAdding && (
              <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {editingId ? 'Edit Goal' : 'Create New Goal'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Goal Type
                      </label>
                      <select
                        value={formData.goal_type}
                        onChange={(e) => setFormData({ ...formData, goal_type: e.target.value as keyof typeof GOAL_TYPES })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                        required
                      >
                        {Object.entries(GOAL_TYPES).map(([key, { label }]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Target Value
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.target_value}
                        onChange={(e) => setFormData({ ...formData, target_value: parseInt(e.target.value) })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Period
                      </label>
                      <select
                        value={formData.period}
                        onChange={(e) => setFormData({ ...formData, period: e.target.value as keyof typeof PERIODS })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                        required
                      >
                        {Object.entries(PERIODS).map(([key, { label }]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Time Period
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Start</label>
                          <input
                            type="date"
                            value={formData.start_date}
                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">End</label>
                          <input
                            type="date"
                            value={formData.end_date}
                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                    >
                      {isLoading ? 'Saving...' : (editingId ? 'Update Goal' : 'Create Goal')}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Add Goal Button */}
            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="w-full mb-6 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                <Plus size={20} />
                Create New Goal
              </button>
            )}

            {/* Goals List */}
            <div className="space-y-4">
              {goals.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Target size={64} className="mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No goals set</h3>
                  <p>Create your first reading goal to track your progress</p>
                </div>
              ) : (
                goals.map((goal) => (
                  <div
                    key={goal.id}
                    className="p-6 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {GOAL_TYPES[goal.goal_type as keyof typeof GOAL_TYPES]?.label}
                          </h3>
                          {isCompleted(goal) && (
                            <CheckCircle className="text-green-500" size={20} />
                          )}
                          {isExpired(goal.end_date) && !isCompleted(goal) && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                              Expired
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Target:</span>
                            <span className="ml-2 font-medium text-gray-900 dark:text-white">
                              {formatValue(goal.target_value, goal.goal_type)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Progress:</span>
                            <span className="ml-2 font-medium text-gray-900 dark:text-white">
                              {formatValue(goal.current_value, goal.goal_type)} ({Math.round(calculateProgress(goal))}%)
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Time left:</span>
                            <span className={`ml-2 font-medium ${getStatusColor(goal)}`}>
                              {isExpired(goal.end_date) ? 'Expired' : `${getDaysRemaining(goal.end_date)} days`}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${getProgressColor(goal)}`}
                              style={{ width: `${calculateProgress(goal)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => startEdit(goal)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition"
                          title="Edit goal"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition"
                          title="Delete goal"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>
                          {new Date(goal.start_date).toLocaleDateString()} - {new Date(goal.end_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp size={14} />
                        <span>{goal.period} goal</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};