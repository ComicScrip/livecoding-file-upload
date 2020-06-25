import React from "react";
import useResourceCollection from "../hooks/useResourceCollection";
import useFormData from "../hooks/useFormData";

export const TaskForm = () => {
  const {fields, setFields, handleFieldChange} = useFormData({name: '', done: false});
  const {saveResource, newResourceIsSaving, newResourceSaveError} = useResourceCollection('/tasks')

  const handleSubmit = async (event) => {
    event.preventDefault()
    await saveResource(fields)
    setFields({name: ''})
  }

  return (
    <form>
      <input
        required
        name="name"
        id="name"
        placeholder="New task name"
        value={fields.name}
        onChange={handleFieldChange}
      />
      <button
        onClick={handleSubmit}
        disabled={newResourceIsSaving || fields.name === ""}
      >
        Save
      </button>
      {newResourceSaveError && (
        <p className="errorText">An error occured while saving the task</p>
      )}
    </form>
  );
};

export default TaskForm