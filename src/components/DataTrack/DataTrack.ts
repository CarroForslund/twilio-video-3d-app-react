import { useEffect } from 'react';
import { DataTrack as IDataTrack } from 'twilio-video';
import { useAppState } from '../../state';


export default function DataTrack({ track }: { track: IDataTrack }) {
  const { setTexture } = useAppState();

  const handleMessage = function(message: number){
    console.log('DataTrack -> handleMessage -> message', message);

    // Uppdate state
    setTexture(message);

  }
  useEffect(() => {
    track.on('message', handleMessage);
  }, []);

  return null; // This component does not return any HTML, so we will return 'null' instead.
}