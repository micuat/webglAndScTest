s.options.device = "MME : Speakers (Surface Dock)";
Server.internal.options.device = "MME : Speakers (Surface Dock)";
s.boot;


(
SynthDef(\sin, { arg bus = 0, freq = 440, carPartial = 1, modPartial = 1, index = 3, mul = 1.0;
	var mod;
	var car;
	mod = SinOsc.ar(
		freq: freq * modPartial,
		mul: freq * index * LFNoise1.kr(5.reciprocal).abs
	);

	car = SinOsc.ar(
		freq: (freq * carPartial) + mod,
		mul: mul
	);

	Out.ar(bus, car ! 2)
}).add;

SynthDef(\preDelay, { arg outBus = 0, gain, inBus, delay, effect;
	Out.ar(outBus, gain*(DelayN.ar(Limiter.ar(InFeedback.ar(outBus, 1)),0.01,Rand(0.001,0.01),effect)+DelayN.ar(In.ar(inBus, 1), 0.01, 0.01)) ! 2);
}).add;

SynthDef(\reverb, { arg outBus = 0, inBus, effect, mix = 0.25, room = 0.15, damp = 0.5;
    var input, input0;
    input0 = In.ar(inBus, 1);

    input = FreeVerb.ar(
        input0, // mono src
        mix, // mix 0-1
        room, // room 0-1
		damp // damp 0-1 duh
	) ! 2;
	Out.ar(outBus, input * effect + (1-effect) * input0);
}).add;
)

b = Bus.audio(s,1); // this will be our effects bus
(
x = Synth.new(\preDelay, [\inBus, b]);
// x = Synth.new(\reverb, [\inBus, b]);
a = Synth.before(x, \sin, [\bus, b, \freq, 440, \carPartial, 1, \modPartial, 1.99, \mul, 0.071]);

OSCdef(\control00, {|msg|
	a.set(\freq, msg[1] * 1);
}, "/control/00");

OSCdef(\control01, {|msg|
	a.set(\carPartial, msg[1] * 0.001);
}, "/control/01");

OSCdef(\control02, {|msg|
	a.set(\modPartial, msg[1] * 0.001);
}, "/control/02");

OSCdef(\control03, {|msg|
	a.set(\index, msg[1] * 24 * 0.001);
}, "/control/03");

OSCdef(\control04, {|msg|
	x.set(\effect, msg[1] * 1 * 0.002);
}, "/control/04");

OSCdef(\control05, {|msg|
	x.set(\mix, msg[1] * 1 * 0.001);
}, "/control/05");

OSCdef(\control06, {|msg|
	x.set(\delay, msg[1] * 1 * 0.001);
	// x.set(\room, msg[1] * 1 * 0.001);
}, "/control/06");

OSCdef(\control07, {|msg|
	x.set(\gain, msg[1] * 1 * 0.002);
}, "/control/07");
)






(
SynthDef("help-InFeedback", { arg out=0, in=0;
    var input, sound;
	input = DelayN.ar(Limiter.ar(InFeedback.ar(in, 1)),0.1,Rand(0.001,0.002));
	sound =  Saw.ar(BrownNoise.ar() * 10 + 10,EnvGen.ar(Env([0, 1, 1, 1, 0], [0.01, 0.5, 0.02, 0.5]),Impulse.ar(1)))+input;
        Out.ar(out, sound!2);

}).play;
)
