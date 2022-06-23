import './i.scss'
import {useMemo, useState} from "react";

export const Carousel = ({
                             slideIndex = 0,
                             className = '',
                             interval = 5e3,
                             autoPlay = false,
                             dot = false,
                             spacing = 0,
                             threshold = 0.2,
                             children = [],
                             beforeSlide
                         }) => {
    const state = useMemo(() => {
        return {
            index: slideIndex,
            el: null,
            next: 0,
            stop: 0
        }
    }, [])
    const [act, sAct] = useState(state.index)


    function init(el) {
        if (el && el !== state.el) {
            state.stop = 1
            setTimeout(next, 100, 1)
            state.el = el;
            const length = children.length || 1
            let x = 0
            let lastX = 0
            let start = 0
            let width = el.offsetWidth
            let style = el.children[0].style;
            style.width = length * 300 + '%'
            fixIndex()
            renderTransform()
            setAni(true)

            function getX(e) {
                const {touches} = e
                if (touches) {
                    lastX = touches[0].clientX
                }
                return lastX
            }

            function fixIndex(n) {
                if (!n) n = 0;
                const v = state.index - n
                if (v >= length || v < 0) {
                    state.index = (state.index + length) % length
                }
            }

            function setAni(v) {
                el.className = el.className.replace(/ --ani/gi, '') + (v ? ' --ani' : '')
            }

            function renderTransform(v = 0) {
                style.transform = `translate3d(${-width * (state.index + length) + v}px,0,0)`
                if (!v) sAct(state.index % length)
            }

            function onStart(e) {
                x = getX(e)
                state.next = Number.MAX_SAFE_INTEGER
            }

            function onMove(e) {
                if (!start) {
                    start = 1
                    setAni(false)
                }
                renderTransform(getX(e) - x)
            }

            function onEnd() {
                if (!start) return
                const mv = lastX - x
                if (mv === 0) {
                    setAni(1)
                    return
                }
                const r = mv / width
                const absR = Math.abs(r)
                const c = r / absR
                if (absR > threshold) {
                    if (typeof beforeSlide === 'function') {
                        setTimeout(beforeSlide, 0,
                            state.index % length,
                            (state.index - c + length) % length,
                        )
                    }
                }
                setAni(1)
                lastX = x = 0
                state.index -= c
                setTimeout(renderTransform, 20)
                setTimeout(renderTransform, 550)
                setTimeout(fixIndex, 30)
                setTimeout(setAni, 540)
                setTimeout(setAni, 600, 1)
                setTimeout(() => {
                    start = 0
                }, 600,)
                state.next = Date.now() + interval + 600
            }

            function next(start) {
                if (start) state.stop = 0
                else if (state.stop) return;
                let p = typeof autoPlay === 'function' ? autoPlay() : autoPlay()
                if (interval && p) {
                    const now = Date.now()
                    if (state.next < now) {
                        fixIndex(1)
                        setAni(0)
                        setTimeout(() => {
                            renderTransform()
                            state.index++
                        }, 30)
                        setTimeout(setAni, 60, 1)
                        setTimeout(renderTransform, 100)
                        state.next = now + interval
                    }
                }
                requestAnimationFrame(next)
            }

            el.onmousedown = el.ontouchstart = onStart
            el.onmousemove = el.ontouchmove = onMove
            el.onmousedown = el.onmouseleave = el.ontouchend = el.ontouchcancel = onEnd
        }
    }

    const animate = (next) => {
        if (next()) return;
        requestAnimationFrame(() => animate(next))
    }

    const style = {
        width: `${state}`
    }

    const s0 = spacing ? {
        padding: `0 ${spacing / 3 / children.length}%`
    } : null
    return <div className={'z-carousel' + (className ? ' ' + className : '')}>
        <div className={'z-cal-box'} ref={el => init(el)}>
            <div className={'slider-list'} style={style}>
                {children.concat(children, children).map(
                    (a, k) => <div className={'z-cal-itm'} key={k} style={s0}>
                        {a}
                    </div>
                )}
            </div>
        </div>
        {dot ? <div className={'z-cal-dots'}>
            {children.map((_, k) => <i key={k} className={act === k ? 'act' : ''}/>)}
        </div> : null}
    </div>
}
