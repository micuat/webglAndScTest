s.options.device = "MME : Speakers (Surface Dock)";
s.options.device = "MME : Headphones (Realtek High Defini";
s.boot;


(
SynthDef(\sin, { arg outBus = 0, freq = 440, carPartial = 1, modPartial = 1, index = 3, mul = 1.0;
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

	Out.ar(outBus, car ! 2)
}).add;

SynthDef(\delay, { arg outBus = 0, gain = 0.0, inBus;
	Out.ar(outBus, DelayN.ar(In.ar(inBus, 2), 0.01, 0.01, gain));
}).add;

SynthDef(\feedback, { arg outBus = 0, gain = 0.0, inBus, delay = 0.1, effect;
	Out.ar(outBus, (DelayN.ar(Limiter.ar(InFeedback.ar(outBus, 2)),1.0,delay,effect)+gain*DelayN.ar(In.ar(inBus, 2), 0.01, 0.01)));
}).add;
)

(
b = Bus.audio(s,2); // this will be our effects bus
c = Bus.audio(s,2);
y = Synth.new(\delay, [\inBus, c, \outBus, 0, \gain, 1.0]);
x = Synth.before(y, \feedback, [\inBus, b, \outBus, c, \gain, 0.0, \effect, 1, \delay, 0.1]);
a = Synth.before(x, \sin, [\outBus, b, \freq, 440, \carPartial, 1, \modPartial, 1.99, \mul, 1]);

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
	x.set(\gain, msg[1] * 1 * 0.002);
}, "/control/05");

OSCdef(\control06, {|msg|
	x.set(\delay, msg[1] * 1 * 0.001);
}, "/control/06");

OSCdef(\control07, {|msg|
	y.set(\gain, msg[1] * 1 * 0.001);
}, "/control/07");
)
