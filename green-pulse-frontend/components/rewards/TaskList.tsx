
import React, { useState } from 'react';
import Card from '../ui/Card';
import { CheckSquare, Square } from 'lucide-react';

const initialTasks = [
  { id: 'task1', text: 'Turn off lights in unused meeting rooms.', completed: false },
  { id: 'task2', text: 'Set office thermostats 1°C higher in summer.', completed: false },
  { id: 'task3', text: 'Ensure all non-essential equipment is off overnight.', completed: false },
  { id: 'task4', text: 'Report any dripping faucets or water leaks.', completed: true },
  { id: 'task5', text: 'Opt for natural light instead of artificial when possible.', completed: false },
];

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState(initialTasks);

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Card className="h-full flex flex-col">
      <h2 className="text-xl font-bold text-text-primary mb-2">Today's Green Tasks</h2>
      <p className="text-sm text-text-secondary mb-4">Complete these tasks to contribute to our campus-wide savings goals.</p>
      
      <div>
        <div className="flex justify-between text-xs font-semibold text-text-secondary mb-1">
          <span>Progress</span>
          <span>{completedCount}/{totalCount} Done</span>
        </div>
        <div className="w-full bg-bg-secondary rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="space-y-3 mt-4 flex-1 overflow-y-auto pr-2">
        {tasks.map(task => (
          <div
            key={task.id}
            onClick={() => handleToggleTask(task.id)}
            className="flex items-center p-3 rounded-lg cursor-pointer transition-colors hover:bg-white/5"
          >
            {task.completed ? (
              <CheckSquare className="w-5 h-5 text-primary flex-shrink-0" />
            ) : (
              <Square className="w-5 h-5 text-text-secondary flex-shrink-0" />
            )}
            <p className={`ml-3 text-sm ${task.completed ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
              {task.text}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TaskList;
