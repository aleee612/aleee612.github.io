### 启动方式
- 在终端输入jshell 即可
```bash
C:\user\9299\>jshell
```

- JShell会自动打印输入的每一个表达式的值
- 输入必须遵循Java语法
### 特性
##### Tab补全
e.g：
```bash
jshell> Math.
<再次按 Tab 可查看所有可能的输入提示; 可能的输入提示总计: 103>
jshell> Math.
E                       IEEEremainder(          PI                      TAU                     abs(
absExact(               acos(                   addExact(               asin(                   atan(
atan2(                  cbrt(                   ceil(                   ceilDiv(                ceilDivExact(
ceilMod(                clamp(                  class                   copySign(               cos(
cosh(                   decrementExact(         divideExact(            exp(                    expm1(
floor(                  floorDiv(               floorDivExact(          floorMod(               fma(
getExponent(            hypot(                  incrementExact(         log(                    log10(
log1p(                  max(                    min(                    multiplyExact(          multiplyFull(
multiplyHigh(           negateExact(            nextAfter(              nextDown(               nextUp(
pow(                    random()                rint(                   round(                  scalb(
signum(                 sin(                    sinh(                   sqrt(                   subtractExact(
tan(                    tanh(                   toDegrees(              toIntExact(             toRadians(
ulp(                    unsignedMultiplyHigh(
jshell> Math.
```
- 可以得到在generator变量上调用的所有方法的一个列表