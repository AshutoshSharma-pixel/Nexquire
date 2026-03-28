import { storage } from './firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export const uploadCAMS = async (userId: string, file: File) => {
  const storageRef = ref(storage, `cams/${userId}/${Date.now()}_${file.name}`)
  const snapshot = await uploadBytes(storageRef, file)
  const url = await getDownloadURL(snapshot.ref)
  return url
}
