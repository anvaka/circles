# Circles

I discovered a toy called "Spirograph". Was curious to implement something
similar in JavaScript, and this is the result of couple hours of work.

I haven't checked all the math yet, please feel free to correct me if something
is odd.

Let's imagine we have a small circle with radius `r` inside a circle with radius `R`.
The inner circle center can be rotated according to simple

```
inner_cx = Math.cos(a) * (R - r)
inner_cy = Math.sin(a) * (R - r)
```

Now we want to figure out how much the inner circle has rotated, when outer circle
rotated by `a` radians? Assuming circles are "stitched" together, they both
should travel the same arc length.

By definition of an [a radian](https://en.wikipedia.org/wiki/Radian) the arc length
with angle `a` radians and radius `R` is `s = R * a`. 

Since both circles rotate together, we know that inner circle is rotated by unknown
angle `b`, and travels the same distance `s`. So:

```
r * b = R * a    =>    b = (R/r) * a
```

And we get our "unknown" inner rotation. Since circles are rotated in opposite
directions, we also add minus sigh to the final angle: 

```
b = -(R/r) * a
```

And now we can compute any point inside inner circle.
