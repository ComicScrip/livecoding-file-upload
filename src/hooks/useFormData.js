import {useState} from 'react'
import produce from 'immer'

export default function useFormData(initialValues = {}) {
  const [fields, setFields] = useState(initialValues);
  const changeField = (key, value) => {
    setFields({...fields, [key]: value})
  }
  const handleFieldChange = (event) => {
    changeField(event.target.name, event.target.value)
  }

  return {
    setFields,
    fields,
    changeField,
    handleFieldChange
  }
}