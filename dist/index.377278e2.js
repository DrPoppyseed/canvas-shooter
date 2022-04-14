const canvas = document.querySelector('canvas');
const c = canvas?.getContext('2d');
canvas.width = innerWidth;
canvas.height = innerHeight;
const spawnEnemies = ()=>{
    setInterval(()=>{
        const oX = Math.random() * canvas.width;
        const oY = Math.random() * canvas.height;
        const radius = Math.random() * 10 + 10;
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
        const velocity = getVelocity({
            oX,
            tX: x,
            oY,
            tY: y
        });
        enemies.push(new Enemy(oX, oY, radius, color, velocity));
    }, 1000);
};
addEventListener('click', (event)=>{
    const { clientX , clientY  } = event;
    const velocity = getVelocity({
        oX: x,
        tX: clientX,
        oY: y,
        tY: clientY,
        speed: 4
    });
    projectiles.push(new MovingCircle(x, y, 5, 'white', velocity));
});
animate();
spawnEnemies();

//# sourceMappingURL=index.377278e2.js.map
