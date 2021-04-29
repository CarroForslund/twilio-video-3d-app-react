import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { useAppState } from '../../state';
const OrbitControls = require('three-orbit-controls')(THREE);

const useStyles = makeStyles((theme) =>
  createStyles({
    positionAbsolute: {
      position: 'absolute',
      width: '100%',
    },
    positionTopLeft: {
      position: 'absolute',
      top: '1rem',
      left: '1rem',
    }
  })
);

export default function Canvas() {
  let mount = useRef(null);
  const { room } = useVideoContext();
  const classes = useStyles();
  const { textureArray, texture, setTexture } = useAppState();

  // Get the LocalDataTrack that is published to the room.
  const [localDataTrackPublication] = [...room.localParticipant.dataTracks.values()];

  useEffect( () => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xcccccc );

    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.domElement.id = 'canvas'; // set ID on 3D canvas
    mount.appendChild( renderer.domElement );

    // instantiate a texture loader
    const loader = new THREE.TextureLoader();
    //allow cross origin loading
    loader.crossOrigin = '';

    // MOVED TO STATE (remove outcommented code before launch)
    // The textures to use
    // const arr = [
    //   'https://s3-us-west-2.amazonaws.com/s.cdpn.io/259155/THREE_gates.jpg',
    //   'https://s3-us-west-2.amazonaws.com/s.cdpn.io/259155/THREE_crate1.jpg',
    //   'https://s3-us-west-2.amazonaws.com/s.cdpn.io/259155/THREE_crate2.jpg'
    // ];
    let textureToShow = texture || 0;

    const controls = new OrbitControls( camera, renderer.domElement );
    controls.update();
    
    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshBasicMaterial();
    
    const cube = new THREE.Mesh( geometry, material );
    
    // Then load the texture    
    loader.load(textureArray[textureToShow], function(tex) {

      // Once the texture has loaded assign it to the material
      material.map = tex;

      // Update the next texture to show
      textureToShow++;

      // Add the mesh into the scene
      scene.add( cube );
      
    });

    // Click interaction
    const button = document.getElementById('cube-btn');

    button.addEventListener("click", function() {

      loader.load(textureArray[textureToShow], function(tex) {

        // Once the texture has loaded, assign it to the material
        material.map = tex;

        // Update the next texture to show
        textureToShow++;

        // Have we got to the end of the textures array
        if(textureToShow > textureArray.length-1) {
          textureToShow = 0;
        }

        // Send data to stream
        if (localDataTrackPublication && room) {
          localDataTrackPublication.track.send(textureToShow);
        }

      });
      
    });

    const animate = function () {
      requestAnimationFrame( animate );
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render( scene, camera );
      controls.update();
    }
    animate();
  },[localDataTrackPublication, room, texture, setTexture, textureArray])
  
  return (
    <>
      <div id="threed" className={classes.positionAbsolute} ref={ref => (mount = ref)} />
      <button id="cube-btn" className={classes.positionTopLeft}>Change texture</button>
    </>
  )
}