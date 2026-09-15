import { ShoulderPress } from "./shoulderPress.js";
import { BicepCurl } from "./bicepCurl.js";
import { Squat } from "./squat.js";
import { TricepExtension } from "./tricepExtension.js";
import { LateralRaise } from "./lateralRaise.js";
import { DumbbellBenchPress } from "./dumbbellBenchPress.js";
import { SingleArmDumbbellRow } from "./singleArmRow.js";
import { RussianTwist } from "./russianTwist.js";

class ClientExerciseRegistry {
  constructor() {
    this.classes = {
      shoulder_press: ShoulderPress,
      bicep_curl: BicepCurl,
      squat: Squat,
      tricep_extension: TricepExtension,
      lateral_raise: LateralRaise,
      dumbbell_bench_press: DumbbellBenchPress,
      single_arm_dumbbell_row: SingleArmDumbbellRow,
      russian_twist: RussianTwist,
    };

    this.instances = {};
  }

  getExercise(id) {
    const key = id ? id.toLowerCase() : "shoulder_press";
    if (!this.instances[key]) {
      const cls = this.classes[key] || ShoulderPress;
      this.instances[key] = new cls();
    }
    return this.instances[key];
  }

  listExercises() {
    return Object.keys(this.classes).map((key) => {
      const ex = this.getExercise(key);
      return ex.getDetails();
    });
  }
}

export const registry = new ClientExerciseRegistry();
