kaboom({
    global: true,
    fullscreen: true,
    scale: 1,
    debug: true,
    clearColor: [0,0,0,1],
})


const MOVE_SPEED = 120

//loadRoot('https://i.imgur.com/')

//--------CHARACTER MOVES ------
loadSprite('link-going-left', 'https://i.imgur.com/1Xq9biB.png' )
loadSprite('link-going-right', 'https://i.imgur.com/yZIb8O2.png')
loadSprite('link-going-down', 'https://i.imgur.com/r377FIM.png')
loadSprite('link-going-up', 'https://i.imgur.com/UkV0we0.png')

//----------WALLS -------
loadSprite('left-wall', 'https://i.imgur.com/rfDoaa1.png')
loadSprite('top-wall', 'https://i.imgur.com/QA257Bj.png')
loadSprite('bottom-wall', 'https://i.imgur.com/vWJWmvb.png')
loadSprite('right-wall', 'https://i.imgur.com/SmHhgUn.png')

loadSprite('bottom-left-wall', 'https://i.imgur.com/awnTfNC.png')
loadSprite('bottom-right-wall', 'https://i.imgur.com/84oyTFy.png')
loadSprite('top-left-wall', 'https://i.imgur.com/xlpUxIm.png')
loadSprite('top-right-wall', 'https://i.imgur.com/z0OmBd1.png')

//--------COMPONETS --------
loadSprite('top-door', 'https://i.imgur.com/U9nre4n.png')
loadSprite('fire-pot', 'https://i.imgur.com/I7xSp7w.png')
loadSprite('left-door', 'https://i.imgur.com/okdJNls.png')
loadSprite('lanterns', 'https://i.imgur.com/wiSiY09.png')
loadSprite('slicer', 'https://i.imgur.com/c6JFi5Z.png')
loadSprite('skeletor', 'https://i.imgur.com/Ei1VnX8.png')

loadSprite('kaboom', 'https://i.imgur.com/o9WizfI.png')
loadSprite('stairs', 'https://i.imgur.com/VghkL08.png')
loadSprite('bg', 'https://i.imgur.com/u4DVsx6.png')

scene("game", ({ level, score }) => {
    layers(['bg', 'obj', 'ui'], 'obj')

   

    const maps = [
        [
            'ycc)cc^ccw',
            'a        b',
            'a      * b',
            'a    (   b',
            '%        b',
            'a    (   b',
            'a   *    b',
            'a        b',
            'xdd)dd)ddz',
        ],

        [
            'ycccccccccw',
            'a    c   $b',
            ')    c  } )',
            'a         b',
            'a         b',
            'a         b',
            ')   }     )',
            'a     d   b',
            'xdddddddddz',   
        ]
    ]

    const levelCfg = {
        width: 48,
        height: 48,
        'a': [sprite('left-wall'), solid(), 'wall'],
        'b': [sprite('right-wall'), solid(), 'wall'],
        'c': [sprite('top-wall'), solid(), 'wall'],
        'd': [sprite('bottom-wall'), solid(), 'wall'],

        'w': [sprite('top-right-wall', solid()), 'wall'],
        'x': [sprite('bottom-left-wall', solid()), 'wall'],
        'y': [sprite('top-left-wall', solid()), 'wall'],
        'z': [sprite('bottom-right-wall', solid()), 'wall'],

        '%': [sprite('left-door'), solid(), 'door'],
        '^': [sprite('top-door'), 'next-level'],
        '$': [sprite('stairs'), 'next-level'],
        '*': [sprite('slicer'), 'slicer', { dir: -1 } , 'dangererous'],
        '}': [sprite('skeletor'), 'dangererous', 'skeletor', { dir: -1, timer: 0 }],
        ')': [sprite('lanterns', solid())],
        '(': [sprite('fire-pot', solid())],


    }
    addLevel(maps[level], levelCfg)

    add([sprite('bg'), layer('bg')])

    const scoreLabel = add([
        text('0'),
        pos(400, 450),
        layer('ui'),
        {
            value: score,
        },
        scale(2)
    ])

    add([text('level ' + parseInt(level + 1)), pos(400,475), scale(2)])

    const player = add([
        sprite('link-going-right'),
        pos(5, 190),
        {
            // right by default
            dir: vec2(1,0),
        }
    ])

    player.action(() =>{
        player.resolve()
    })

    player.overlaps('next-level', () => {
        go("game", {
            level: (level + 1) % maps.length,
            score: scoreLabel.value 
        })
    })

    keyDown('left', () => {
        player.changeSprite('link-going-left')
        player.move(-MOVE_SPEED, 0)
        player.dir = vec2(-1, 0)
    })

    keyDown('right', () => {
        player.changeSprite('link-going-right')
        player.move(MOVE_SPEED, 0)
        player.dir = vec2(1, 0)
    })

    keyDown('up', () => {
        player.changeSprite('link-going-up')
        player.move(0, -MOVE_SPEED)
        player.dir = vec2(0, -1)
    })

    keyDown('down', () => {
        player.changeSprite('link-going-down')
        player.move(0, MOVE_SPEED)
        player.dir = vec2(0, 1)
    })

    function spawnKaboom(p) {
        const obj = add([sprite('kaboom'), pos(p), 'kaboom'])
        wait(1, () => {
            destroy(obj)
        })
    }

    keyPress('space', () => {
        spawnKaboom(player.pos.add(player.dir.scale(48)))
    })

    player.collides('door',(d) => {
        destroy(d)
    })
    
    collides('kaboom', 'skeletor', (k, s) => {
        camShake(4)
        wait(1, () => {
            destroy(k)
        })
        destroy(s)
        scoreLabel.value++
        scoreLabel.text = scoreLabel.value
    })

    const SLICER_SPEED = 100

    action('slicer', (s) => {
        s.move(s.dir * SLICER_SPEED, 0)
    })

    collides('slicer', 'wall', (s) => {
        s.dir = -s.dir
    })

    const SKELETOR_SPEED = 70

    action('skeletor', (s) => {
        s.move(0, s.dir * SKELETOR_SPEED)
        s.timer -=dt()
        if (s.timer <= 0) {
            s.dir = - s.dir
            s.timer = rand(5)
        } 
    })

    collides('skeletor', 'wall', (s) => {
        s.dir = -s.dir
    })

    player.overlaps('dangererous', () =>{
        go('lose', { score: scoreLabel.value })
    })

})

scene("lose", ({ score }) => {
    add( [text(score, 32), origin('center'), pos(width() / 2, height() / 2 )])
})

start("game", { level: 0, score: 0})