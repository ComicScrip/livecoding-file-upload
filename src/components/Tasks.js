import React from "react";
import useResourceCollection from "../hooks/useResourceCollection";

export const Tasks = () => {
  const {collection: tasksToShow, fetchCollectionError: fetchError, saveResource, deleteResource} = useResourceCollection('/tasks');

  if (fetchError) {
    return (
        <p className="errorText">An error occured while fetching the tasks.</p>
    );
  }
  if (!tasksToShow) return 'Loading...'

  const optimisticallyToggleTask = async task => {
    saveResource({...task, done: !task.done}, {optimistic: true})
  }

  const optimisticallyDeleteTask = async task => {
    deleteResource(task.id, {optimistic: true})
  }

  return (
    <table>
      <thead>
        <tr>
          <td>Name</td>
          <td>Done ?</td>
          <td>delete</td>
        </tr>
      </thead>
      <tbody>
        {tasksToShow.map(t => {
          return (
            <tr key={t.id}>
              <td style={{opacity: (!!t._saving || !!t._deleting) ? 0.7 : 1}}>{t.name}</td>
              <td>
                <input
                  disabled={!!t._saving}
                  type="checkbox"
                  checked={t.done}
                  onChange={() => {
                    optimisticallyToggleTask(t);
                  }}
                />
              </td>
              <td>
                <button 
                  onClick={() => optimisticallyDeleteTask(t)}
                  disabled={!!t._deleting}
                >
                  Delete
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default Tasks;