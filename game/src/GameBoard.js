

import React from 'react';

import { calculateStats, calculateVisibleStats, calculateCombatStats} from './StatCalculation.js';
import { doBattle, getDistance, positionToRowColumn, rowColumnToPosition, calculateMovementEffect, checkValidMovement, getDamageType, checkCondition, getDistantHeroes, 
  calculateVariableEffect, calculateVariableCombat, getConditionalSpecial, removeConditionalSpecial, getSpecialDamage} from './Battle.js';

import './App.css';


import TeamElement from './TeamElement.js';
import Stats from './Stats.js';
import Skills from './Skills.js';
import Field from './Field.js';
import BattleWindow from './BattleWindow.js';
import Map from './Map.js';

//Json imports
import heroData from './heroInfo.json';
import weapons from './weapons.js';
import specials from './skills/special.json';
import assists from './skills/assist.json';
import skills from './skillList.js';

var heroStruct = makeHeroStruct();




//handles the gameboard as well as the heroes which
class GameBoard extends React.Component{

	

	constructor(props){
    super(props);

    let initDropdowns = { "hero":{list: [], info: heroData}, "weapon":{list: [], info: weapons["sword"]},
                         "assist":{list: [], info: assists}, "special":{list: [], info: specials},
                         "a":{list: [], info: skills.a}, "b":{list: [], info: skills.b}, 
                         "c":{list: [], info: skills.c}, "seal":{list: [], info: skills.seal}
                        };




    // eslint-disable-next-line
    for (var [key, value] of Object.entries(initDropdowns)) {

      this.fillDropdown(value.list, value.info, new heroStruct(0));
    }                

    this.state = {
      "heroList": { 
        "1":[new heroStruct(0), new heroStruct(1), new heroStruct(2), new heroStruct(3), new heroStruct(4)],
        "2": [new heroStruct(6), new heroStruct(7), new heroStruct(8), new heroStruct(9), new heroStruct(10), new heroStruct(11)]
      }, //skips id 5 for listIndex  
      "heroIndex": 0, //The index of the hero in the heroList
      "playerSide": "1", //The side of the hero. 1 means player, 2 means enemy
      "skillDropdowns": initDropdowns,
      "selectedMember": new heroStruct(0), //The current struct in heroList
      "weaponList": weapons["sword"],
      "selectedHeroInfo": heroData["0"], //The current hero's info
      "maxFilter": false,
      "currentTurn": 0,
      "fortLevel": 0,
      "blessingBuffs": { //the buffs each season will give a team - one for each team
        "1": {
          "Water": {"hp": 0, "atk": 0, "spd": 0, "def": 0, "res": 0},
          "Earth": {"hp": 0, "atk": 0, "spd": 0, "def": 0, "res": 0},
          "Wind": {"hp": 0, "atk": 0, "spd": 0, "def": 0, "res": 0},
          "Fire": {"hp": 0, "atk": 0, "spd": 0, "def": 0, "res": 0},
          "Light": {"hp": 0, "atk": 0, "spd": 0, "def": 0, "res": 0},
          "Dark": {"hp": 0, "atk": 0, "spd": 0, "def": 0, "res": 0},
          "Astra": {"hp": 0, "atk": 0, "spd": 0, "def": 0, "res": 0},
          "Anima": {"hp": 0, "atk": 0, "spd": 0, "def": 0, "res": 0}
        } ,
        "2": {
          "Water": {"hp": 0, "atk": 0, "spd": 0, "def": 0, "res": 0},
          "Earth": {"hp": 0, "atk": 0, "spd": 0, "def": 0, "res": 0},
          "Wind": {"hp": 0, "atk": 0, "spd": 0, "def": 0, "res": 0},
          "Fire": {"hp": 0, "atk": 0, "spd": 0, "def": 0, "res": 0},
          "Light": {"hp": 0, "atk": 0, "spd": 0, "def": 0, "res": 0},
          "Dark": {"hp": 0, "atk": 0, "spd": 0, "def": 0, "res": 0},
          "Astra": {"hp": 0, "atk": 0, "spd": 0, "def": 0, "res": 0},
          "Anima": {"hp": 0, "atk": 0, "spd": 0, "def": 0, "res": 0}
        }
      },
      "season": {"L1": "Water", "L2": "Earth", "M1": "Light", "M2": "Dark"},
      "availableMovement": [],
      "availableAssist": [],
      "availableAttack": [],
      "availableWarp": [],
      "draggedHero": null,
      "draggedHeroOrg": null,
      "draggedOver": null,
      "preBattleDamage": -1,
      "draggedOverOriginalHP": 0,
      "selectedStatusBuff": "bonusDouble",
      "selectedStatusEffect": "guard" 

    }

    this.selectNewMember = this.selectNewMember.bind(this);
    this.onLevelsChange = this.onLevelsChange.bind(this);
    this.onHeroChange = this.onHeroChange.bind(this);
    this.onSkillChange = this.onSkillChange.bind(this);
    this.onMaxFilterChange = this.onMaxFilterChange.bind(this);
    this.onBuffChange = this.onBuffChange.bind(this);
    this.onBonusChange = this.onBonusChange.bind(this);
    this.onEndChange = this.onEndChange.bind(this);
    this.onIVChange = this.onIVChange.bind(this);
    this.onSupportLevelChange = this.onSupportLevelChange.bind(this);
    this.onAllySupportChange = this.onAllySupportChange.bind(this);
    this.onFortLevelChange = this.onFortLevelChange.bind(this);
    this.onTurnChange = this.onTurnChange.bind(this);

    this.onSeasonChange = this.onSeasonChange.bind(this);
    this.onHPChange = this.onHPChange.bind(this);
    this.onSpecialChargeChange = this.onSpecialChargeChange.bind(this);

    this.onSelectedStatusChange = this.onSelectedStatusChange.bind(this);
    this.onStatusChange = this.onStatusChange.bind(this);

    this.getFilledPositions = this.getFilledPositions.bind(this);


    this.dragBoardMember = this.dragBoardMember.bind(this);
    this.dragOverBoard = this.dragOverBoard.bind(this);
    this.dropBoardMember = this.dropBoardMember.bind(this);
    this.dragEnd = this.dragEnd.bind(this);

    this.dragTeamMember = this.dragTeamMember.bind(this);
    this.dragOverTeamMember = this.dragOverTeamMember.bind(this);
    this.dropTeamMember = this.dropTeamMember.bind(this);

    this.startTurn = this.startTurn.bind(this);
    this.endTurn = this.endTurn.bind(this);
  } //end constructor


  updateHero(side, newIndex){ 
    //updates the selectedHero according to playerSide and currentHero values and other values dependent on it

    let newSelected = this.state.heroList[side][newIndex];
    this.setState({selectedMember: newSelected }); //updates the select member with the new hero in heroList


    this.setState({selectedHeroInfo: heroData[newSelected.heroID.value]});


    this.setState({weaponList: weapons[heroData[newSelected.heroID.value].weapontype]});


    this.updateDropdowns(heroData[newSelected.heroID.value], this.state.maxFilter);//weapons[heroData[newSelected.heroID.value].weapontype]);

  }

  updateDropdowns(newHero, newMax){
    let dropTemp = { "hero":{list: [], info: heroData}, "weapon":{list: [], info: weapons[newHero.weapontype]},
                         "assist":{list: [], info: assists}, "special":{list: [], info: specials},
                         "a":{list: [], info: skills.a}, "b":{list: [], info: skills.b}, 
                         "c":{list: [], info: skills.c}, "seal":{list: [], info: skills.seal}
                   };



    // eslint-disable-next-line               
    for (let [key, value] of Object.entries(dropTemp)) {
      this.fillDropdown(value.list, value.info, newHero, newMax);
    }
    
    this.setState({skillDropdowns: dropTemp});
    return dropTemp;
  }

  fillDropdown(dropdownList, info, newHero, newMax){

    
    // eslint-disable-next-line
    for (let [key, value1] of Object.entries(info)) {

      if ( !('prf' in value1) || //if the object has no prf key (e.g. heroInfo) then just push to the list 
        value1.prf === false || //if the prf key says false, then push to the list
        ( !('users' in value1) || value1.users.includes(newHero.name ) )  
        ){ //if it has a user key (temp until those are added to skills) or if the users key has the id
          
          if (!newMax || (  !('max' in value1) || value1.max  ) ){
            dropdownList.push({value: key, label: value1.name});
          }
      }
    }
    dropdownList.sort(this.compareLabels);

  }

  compareLabels(a, b){
    return a.label > b.label ? 1 : b.label > a.label ? -1 : 0;
  }



  selectNewMember(side, i){ // selecting new member

    this.updateHero(side, i);

    this.setState({heroIndex: i});
    this.setState({playerSide: side})
  }

  //Changing of levels affecting stats - includes level, merge, flower and rarity
  onLevelsChange(e, type){ 

    let temp = this.state.heroList;

    let hero = temp[this.state.playerSide][this.state.heroIndex];

    let max = 0;
    let min = 0;

    if (type === "level"){
      max = 40;
      min = 1;
    } else if (type === "merge" || type === "dragonflower"){
      max = 10;
      min = 0;
    } else if (type === "rarity"){
      max = 5;
      min = 1;
    }

    hero[type] = Math.max(min, Math.min(Number(e.target.value), max) );

    let oldMaxHP = hero.stats.hp;

    hero.stats = calculateStats(hero, this.state.fortLevel,
       this.state.blessingBuffs[this.state.playerSide], this.state.season);
    hero.visibleStats = calculateVisibleStats(hero);

    hero.currentHP = this.adjustHP(oldMaxHP, hero);




    temp[this.state.playerSide][this.state.heroIndex] = hero;

    this.setState({heroList: temp});
    this.setState({selectedMember: hero }); //update the selectedHero according to changed level //todo
  }


  onHeroChange(e){    //Changing a hero will need to update the states of the board for stat display

    var temp = this.state.heroList;
    let hero = temp[this.state.playerSide][this.state.heroIndex]; //the current hero


    let tempBlessings = this.state.blessingBuffs; //copy the blessing buffs

    let calcAll = false;

    //the heroInfo of replaced hero
    let oldHero = heroData[hero.heroID.value];

    //Removing old blessing buffs
    if ('type' in oldHero &&   (oldHero.type === "legendary" || oldHero.type === "mythic") ){

      //Loop through each stat for current team and the element and subtract the oldHero's buff from the team buff pool
      Object.keys(tempBlessings[this.state.playerSide][oldHero.blessing]).forEach((key, i) => {
        tempBlessings[this.state.playerSide][oldHero.blessing][key] -= oldHero.buff[key];
      });
      calcAll = true;
    }
    


    hero.heroID = e; //change the heroId of the current hero




    var newHero = heroData[e.value]; //get the heroData from heroInfo.json

    var updatedDropdowns = this.updateDropdowns(newHero, this.state.maxFilter); //only really updates the weaponlist for now


    //hero skill updating
    let tSkills = hero.heroSkills; //Object.assign({}, this.state.heroSkills);

    Object.keys(tSkills).forEach((key, i) => { //clear the skills on the hero for the new defaults that will be set
       hero = this.removeSkillEffect(tSkills[key].value , key, hero);
    });

    tSkills["weapon"] = updatedDropdowns["weapon"].list.find(this.findSkillWithName, newHero.weapon);
    tSkills["assist"] = updatedDropdowns["assist"].list.find(this.findSkillWithName, newHero.assist);
    tSkills["special"] = updatedDropdowns["special"].list.find(this.findSkillWithName, newHero.special);
    tSkills["a"] = updatedDropdowns["a"].list.find(this.findSkillWithName, newHero.askill);
    tSkills["b"] = updatedDropdowns["b"].list.find(this.findSkillWithName, newHero.bskill);
    tSkills["c"] = updatedDropdowns["c"].list.find(this.findSkillWithName, newHero.cskill);
    tSkills["seal"] = updatedDropdowns["seal"].list.find(this.findSkillWithName, newHero.sseal);

    hero.heroSkills = tSkills; //update the new heroes default skills

    //Passives/weapons only currently
    //Add the effects of the skills to the hero
    Object.keys(tSkills).forEach((key, i) => { //need to clear old effects
       hero = this.getSkillEffect(tSkills[key].value , key, hero, updatedDropdowns);
    });



    //Assign the hero's blessing if appropriate -> Otherwise, it will just have any blessing it had previously.
    //Also add the buff to that team
    if (newHero.type === "legendary" || newHero.type === "mythic"){
      hero.blessing = newHero.blessing;
      Object.keys(tempBlessings[this.state.playerSide][newHero.blessing]).forEach((key, i) => {
        tempBlessings[this.state.playerSide][newHero.blessing][key] += newHero.buff[key];
      });      
      calcAll = true;

    }


    
    hero.stats = calculateStats(hero, this.state.fortLevel, tempBlessings[this.state.playerSide], this.state.season); //recalculate stats
    hero.visibleStats = calculateVisibleStats(hero);
    hero.currentHP = hero.stats.hp;

    //Sets the initial position of the on the board 
    if (hero.position === -1 && e.value !== "0"){ //if hero was blank
      hero.side = this.state.playerSide;
      let pos = this.getFilledPositions();
      let x = 0; //check column - always goes from left to right
      let y = 42; //row -> player one starts at bottom row
      let inc = -6; //going up a row requires -6
      if (this.state.playerSide === "2"){
        y = 0; //player 2 starts at top row
        inc = 6; //going down a row is 6
      }
      
      while (hero.position === -1 && (y >=0 && y<=42) ){ //not filled and rows are not out of bound
        if (! (pos.includes(y+x)) ){ //space is free
          hero.position = y+x;
          this.props.G.cells[y+x] = hero;
        } else if (x <5){ //move to next column
          x+=1;
        } else if (x>=5){ //end of row, start at first column and increment row
          x= 0;
          y+=inc;
        } 

      }

    } else{
      this.props.G.cells[hero.position] = hero;
    }

    temp[this.state.playerSide][this.state.heroIndex] = hero;


    //if old or new heroes were legendary/mythic, calculate stats for the team
    if (calcAll){
      temp[this.state.playerSide] = this.recalculateTeamHeroStats(temp[this.state.playerSide], tempBlessings[this.state.playerSide]);
    }


    this.setState({heroList: temp});
    this.setState({selectedMember: hero });

    this.setState({blessingBuffs: tempBlessings});

    this.setState({selectedHeroInfo: heroData[newHero.id]});


    this.setState({weaponList: weapons[heroData[newHero.id].weapontype]});


  }

  findMatchingEffect(item){
    return JSON.stringify(item) === this;
  }

  findMatchingValue(item){
    return item.value === this;
  }
  findSkillWithName(item){
    return item.label === this;
  }

  checkLabelExists(item){
    return item.name === this;
  }

  onSkillChange(e, index){ //e is the new value, index is the key 
    let tempHeroList = this.state.heroList;
    let hero = this.state.heroList[this.state.playerSide][this.state.heroIndex]; //copy of heroList


    let skillList =  Object.assign({}, hero.heroSkills); //copy of hero's skill list

    hero = this.removeSkillEffect(skillList[index].value, index, hero);

    skillList[index] = e; //replace skill
    hero.heroSkills = skillList; //update the temp copy of heroList
    
    //TODO - implement skills  - weapons first
    //Add skill effect to the hero
    hero = this.getSkillEffect(e.value, index, hero, this.state.skillDropdowns); //need to clear old effects

    //TODO - add other types of skills 
    let oldMaxHP = hero.stats.hp;

    hero.stats = calculateStats(hero, this.state.fortLevel, this.state.blessingBuffs[this.state.playerSide], this.state.season);

    hero.visibleStats = calculateVisibleStats(hero);

    hero.currentHP = this.adjustHP(oldMaxHP, hero);
    
    tempHeroList[this.state.playerSide][this.state.heroIndex] = hero; //update the heroList with the updated hero
    //update states
    this.setState({heroList: tempHeroList}); 
    this.setState({selectedMember: hero });


  }

  getSkillEffect(id, skillType, currentHero, skillDropdowns){ //skilltype refers to the slot the skill originates from

    //TODO: Except for weapons and assists (maybe specials), the type of the skill should always key into the same key of the hero and then add their effect


    let updatedHero = currentHero;

    let cdTriggerOrg = updatedHero.effects.cdTrigger;


    let effect = skillDropdowns[skillType].info[id].effect;

    if (skillType === "weapon"){
      let pTemp = updatedHero.passive;
      pTemp["atk"] += skillDropdowns["weapon"].info[id].might; 
      updatedHero.passive = pTemp;
      updatedHero.range = skillDropdowns["weapon"].info[id].range;


    } else if (skillType === "assist"){

      updatedHero.assist = Object.assign({}, skillDropdowns[skillType].info[id] );

    } else if (skillType === "special"){

      //updatedHero.special.type = skillDropdowns[skillType].info[id].type;

      updatedHero.special = Object.assign({}, skillDropdowns[skillType].info[id]);

      var initialCharge = skillDropdowns[skillType].info[id].cd + updatedHero.effects.cdTrigger;

      updatedHero.special.cd = initialCharge;
      updatedHero.special.charge = initialCharge;
      //updatedHero.special.effect = skillDropdowns[skillType].info[id].effect;


    } else if (skillDropdowns[skillType].info[id].type  === "passive") {
      let statMods = effect; //effect should contain the list of stats to buff
      let pTemp = updatedHero.passive;


      Object.keys(statMods).forEach((key, i) => {
        pTemp[key] += statMods[key];
      });

      updatedHero.passive = pTemp;
    } else if (skillDropdowns[skillType].info[id].type === "conditional-effect"){

      for (let x of effect){ //conditional effect list of conditional effects

        if (x.type === "effect"){
          updatedHero.conditionalEffects.push(x); //effect should contain the conditional list
        } else if (x.type === "combat"){
          updatedHero.conditionalCombat.push(x);
        } else if (x.type === "turnStart"){
          updatedHero.turnStart.push(x);
        } else if (x.type === "special"){
          updatedHero.conditionalSpecial.push(x);
        } else if (x.type === "variableStats"){
          updatedHero.variableStats.push(x); //effect should contain the conditional list
        } else if (x.type === "variableCombat"){
          updatedHero.variableCombat.push(x);
        } else if (x.type === "variablePreCombat"){
          updatedHero.variablePreCombat.push(x);
        } else if (x.type === "postCombat"){
          updatedHero.postCombat.push(x);
        }
      }
      
    } else if (skillDropdowns[skillType].info[id].type === "combat-effect"){

      Object.keys(effect).forEach((key, i) => {

        if (key === "penaltyNeutralize"){

          let neutralized = effect.penaltyNeutralize;

          for (let m of neutralized){
            updatedHero.combatEffects.penaltyNeutralize[m]++; 
          }


        } else if (key === "buffNeutralize"){

          let neutralized = effect.buffNeutralize;

          for (let m of neutralized){
            updatedHero.combatEffects.buffNeutralize[m]++; 
          }


        } else if (key === "lull"){

          let lullStats = effect.lull;
          for (let m in lullStats){
            updatedHero.combatEffects.lull[m]+= lullStats[m];
          }

        } else if (key === "seal"){


          updatedHero.combatEffects.seal.push(effect.seal);
          

        } else if (key === "onAttack"){

          updatedHero.onAttack.push(effect.onAttack);

        } else if (key === "postCombat"){

          updatedHero.postCombat.push(effect.postCombat);


        } else {

          updatedHero.combatEffects[key] += effect[key];
        }

      });

    } else if (skillDropdowns[skillType].info[id].type === "warp"){
      updatedHero.warp.push(effect);

    } else if (skillDropdowns[skillType].info[id].type === "on-assist"){
      updatedHero.onAssist.push(effect);

    } else if (skillDropdowns[skillType].info[id].type === "battle-movement"){
      updatedHero.battleMovement = Object.assign({}, effect);

    } else if (skillDropdowns[skillType].info[id].type === "on-special"){
      updatedHero.onSpecial.push(effect);

    }




    if ('skills' in skillDropdowns[skillType].info[id]) { // if the skill has additional skills
      for (var x of skillDropdowns[skillType].info[id].skills) {


        var additionalSkill  = skillDropdowns[x[0]].list.find(this.findSkillWithName, x[1]).value;

        updatedHero = this.getSkillEffect(additionalSkill, x[0], updatedHero, skillDropdowns); //add the extra skills as well
      }

    }


    //Check if skill has a cdtrigger effect cdTriggers
    if ('effect' in skillDropdowns[skillType].info[id] && 'cdTrigger' in effect){
      updatedHero.effects.cdTrigger+= effect.cdTrigger;

    }

    //if the hero's cdTrigger stat has been changed, recalculate special cd.
    if (updatedHero.effects.cdTrigger !== cdTriggerOrg){ //check if 

      //get base cd of special and use modified value
      var newCharge = skillDropdowns["special"].info[updatedHero.heroSkills.special.value].cd + updatedHero.effects.cdTrigger;

      updatedHero.special.cd = newCharge;
      updatedHero.special.charge = newCharge;

    }

    return updatedHero; //hero with new skills

  }

  removeSkillEffect(id, skillType, currentHero){
    let updatedHero = currentHero; //copy of current hero

    let effect = this.state.skillDropdowns[skillType].info[id].effect;
    let cdTriggerOrg = updatedHero.effects.cdTrigger;

    //let emptySkill =   Object.assign({}, this.state.skillDropdowns [skillType].info["0"]);

    if (skillType === "weapon"){
      let pTemp = updatedHero.passive;
      pTemp["atk"] -= this.state.weaponList[id]["might"]; //remove the weapon's attack
      updatedHero.passive = pTemp;
      updatedHero.range = -1;

    } else if (skillType === "assist"){

      updatedHero.assist = {};

    } else if (skillType === "special"){
      updatedHero.special = {};
      updatedHero.special.cd = -10;
      updatedHero.special.charge = -10;

    } else if (this.state.skillDropdowns[skillType].info[id].type  === "passive") {
      let statMods = effect; //effect should contain the list of stats to buff
      let pTemp = updatedHero.passive;


      Object.keys(statMods).forEach((key, i) => {
        pTemp[key] -= statMods[key];
      });


      updatedHero.passive = pTemp;
    } else if (this.state.skillDropdowns[skillType].info[id].type === "conditional-effect"){
      for (let x of effect){
        let condition = JSON.stringify(x); //the conditional in string form

        if (x.type === "effect"){
          let conditionIndex = updatedHero.conditionalEffects.findIndex(this.findMatchingEffect , condition);

          updatedHero.conditionalEffects.splice(conditionIndex, 1); //remove the matched condition

        } else if (x.type === "combat"){
          let conditionIndex = updatedHero.conditionalCombat.findIndex(this.findMatchingEffect , condition);

          updatedHero.conditionalCombat.splice(conditionIndex, 1); //remove the matched condition

        } else if (x.type === "turnStart"){

          let conditionIndex = updatedHero.turnStart.findIndex(this.findMatchingEffect , condition);

          updatedHero.turnStart.splice(conditionIndex, 1); //remove the matched variable effect
        } else if (x.type === "special"){

          let conditionIndex = updatedHero.conditionalSpecial.findIndex(this.findMatchingEffect , condition);

          updatedHero.conditionalSpecial.splice(conditionIndex, 1); //remove the matched variable effect
        } else if (x.type === "variableStats"){
          let variableIndex = updatedHero.variableStats.findIndex(this.findMatchingEffect , condition);
          updatedHero.variableStats.splice(variableIndex, 1); //remove the matched variable effect

        } else if (x.type === "variableCombat"){

          let variableIndex = updatedHero.variableCombat.findIndex(this.findMatchingEffect , condition);
          updatedHero.variableCombat.splice(variableIndex, 1); //remove the matched variable effect


        } else if (x.type === "variablePreCombat"){
          let variableIndex = updatedHero.variablePreCombat.findIndex(this.findMatchingEffect , condition);
          updatedHero.variablePreCombat.splice(variableIndex, 1); //remove the matched variable effect

        } else if (x.type === "onAttack"){
          let variableIndex = updatedHero.onAttack.findIndex(this.findMatchingEffect , condition);
          updatedHero.onAttack.splice(variableIndex, 1); //remove the matched post combat effect


        } else if (x.type === "postCombat"){
          let variableIndex = updatedHero.postCombat.findIndex(this.findMatchingEffect , condition);
          updatedHero.postCombat.splice(variableIndex, 1); //remove the matched post combat effect

        }

      } //end of effect

    } else if (this.state.skillDropdowns[skillType].info[id].type === "combat-effect"){

      Object.keys(effect).forEach((key, i) => {



        if (key === "penaltyNeutralize"){

          let neutralized = effect.penaltyNeutralize;

          for (let m of neutralized){
            updatedHero.combatEffects.penaltyNeutralize[m]--; 
          }


        } else if (key === "buffNeutralize"){

          let neutralized = effect.buffNeutralize;

          for (let m of neutralized){
            updatedHero.combatEffects.buffNeutralize[m]--; 
          }

        } else if (key === "lull"){

          let lullStats = effect.lull;
          for (let m in lullStats){
            updatedHero.combatEffects.lull[m]-= lullStats[m];
          }

        } else if (key === "seal"){

          let sealEffect = JSON.stringify(effect.seal);

          let sealIndex = updatedHero.combatEffects.seal.findIndex(this.findMatchingEffect, sealEffect);
          updatedHero.combatEffects.seal.splice(sealIndex, 1);

        } else if (key === "onAttack"){

          let attackEffect = JSON.stringify(effect.onAttack); //the variable effect in string form

          let effectIndex = updatedHero.onAttack.findIndex(this.findMatchingEffect, attackEffect);

          updatedHero.onAttack.splice(effectIndex, 1); //remove the matched variable effect

        } else if (key === "postCombat"){

          let postCombatEffect = JSON.stringify(effect.postCombat); //the variable effect in string form

          let effectIndex = updatedHero.postCombat.findIndex(this.findMatchingEffect, postCombatEffect);

          updatedHero.postCombat.splice(effectIndex, 1); //remove the matched variable effect

        } else {
        

          updatedHero.combatEffects[key] -= effect[key];
        }
      });


    } else if (this.state.skillDropdowns[skillType].info[id].type === "warp"){

      let warpEffect = JSON.stringify(effect); //the variable effect in string form

      let warpIndex = updatedHero.warp.findIndex(this.findMatchingEffect , warpEffect);

      updatedHero.warp.splice(warpIndex, 1); //remove the matched variable effect
    } else if (this.state.skillDropdowns[skillType].info[id].type === "on-assist"){

      let assistEffect = JSON.stringify(effect); //the variable effect in string form

      let assistIndex = updatedHero.onAssist.findIndex(this.findMatchingEffect , assistEffect);

      updatedHero.onAssist.splice(assistIndex, 1); //remove the matched variable effect

    } else if (this.state.skillDropdowns[skillType].info[id].type === "battle-movement"){
      updatedHero.battleMovement = {};
    } else if (this.state.skillDropdowns[skillType].info[id].type === "on-special"){

      let specialEffect = JSON.stringify(effect); //the variable effect in string form

      let onSpecialIndex = updatedHero.onSpecial.findIndex(this.findMatchingEffect , specialEffect);

      updatedHero.onSpecial.splice(onSpecialIndex, 1); //remove the matched variable effect
    }



    if ('skills' in this.state.skillDropdowns[skillType].info[id]) { // if the skill has additional skills
      for (var x of this.state.skillDropdowns[skillType].info[id].skills) {

        var additionalSkill  = this.state.skillDropdowns[x[0]].list.find(this.findSkillWithName, x[1]).value;

        updatedHero = this.removeSkillEffect(additionalSkill, x[0], updatedHero); //remove the extra skills as well
      }

    }

    //when removing the skill, a new special will be added, so it will adjust there
    if ('effect' in this.state.skillDropdowns[skillType].info[id] && 'cdTrigger' in effect){
      updatedHero.effects.cdTrigger-= effect.cdTrigger;

    }

    if (updatedHero.effects.cdTrigger !== cdTriggerOrg){ //check if 

      //get base cd of special and use modified value
      var newCharge = this.state.skillDropdowns["special"].info[updatedHero.heroSkills.special.value].cd + updatedHero.effects.cdTrigger;

      updatedHero.special.cd = newCharge;
      updatedHero.special.charge = newCharge;

    }

    return updatedHero; //hero with new skills

  }



  onMaxFilterChange(e){

    this.updateDropdowns(this.state.selectedHeroInfo, e.target.checked);
    this.setState({maxFilter: e.target.checked});
  }

  //index is the type of buff -> buff, debuff, combat buff
  //stat, the stat being changed
  onBuffChange(e, index, stat){ //also handles debuffs and combat modifiers
    let temp = this.state.heroList;


    let buffList =  Object.assign({}, temp[this.state.playerSide][this.state.heroIndex][index]); //get the corresponding buff list
    

    buffList[stat] = Number(e.target.value);

    temp[this.state.playerSide][this.state.heroIndex][index] = buffList;
    temp[this.state.playerSide][this.state.heroIndex].visibleStats = calculateVisibleStats(temp[this.state.playerSide][this.state.heroIndex]);

    this.setState({heroList: temp});
    this.setState({selectedMember: temp[this.state.playerSide][this.state.heroIndex] });

  }

  onBonusChange(e){
    var temp = this.state.heroList;
    let hero = temp[this.state.playerSide][this.state.heroIndex]; 
    

    hero.bonus = e.target.checked;

    let oldMaxHP = hero.stats.hp;

    hero.stats =  calculateStats(hero, this.state.fortLevel, this.state.blessingBuffs[this.state.playerSide], this.state.season);
    hero.visibleStats = calculateVisibleStats(hero);
    
    hero.currentHP = this.adjustHP(oldMaxHP, hero);

    temp[this.state.playerSide][this.state.heroIndex] = hero;

    this.setState({heroList: temp});
    this.setState({selectedMember: hero});


  }

  onEndChange(e){
    var temp = this.state.heroList;
    let hero = temp[this.state.playerSide][this.state.heroIndex]; 
    

    hero.end = e.target.checked;

    //only reset if unit has used their action
    if (e.target.checked){
      hero.debuff = {"atk": 0, "spd": 0, "def": 0, "res": 0};
      hero.statusEffect = {"guard": 0, "panic": 0}; 
    }

    temp[this.state.playerSide][this.state.heroIndex] = hero;

    this.setState({heroList: temp});
    this.setState({selectedMember: hero});


  }

  onIVChange(e, type){
    let temp = this.state.heroList;

    let hero = temp[this.state.playerSide][this.state.heroIndex];
    let ivList =  Object.assign({}, hero.iv);
    

    //if either iv is set to neutral, set the other one to neutral as well.
    if (e.target.value === "neutral"){
      ivList.asset = "neutral";
      ivList.flaw = "neutral";
    } else{
    ivList[type] = e.target.value;
    }

    hero.iv = ivList;

    let oldMaxHP = hero.stats.hp;

    hero.stats = calculateStats(hero, this.state.fortLevel, this.state.blessingBuffs[this.state.playerSide], this.state.season);
    hero.visibleStats = calculateVisibleStats(hero);
    
    hero.currentHP = this.adjustHP(oldMaxHP, hero);

    temp[this.state.playerSide][this.state.heroIndex] = hero;

    this.setState({heroList: temp});
    this.setState({selectedMember: temp[this.state.playerSide][this.state.heroIndex] });

  }

  //When support levels or blessings change
  onSupportLevelChange(e, type){
    let temp = this.state.heroList;

    let hero = temp[this.state.playerSide][this.state.heroIndex];

    hero[type] = e.target.value;

    let oldMaxHP = hero.stats.hp;

    hero.stats = calculateStats(hero, this.state.fortLevel, this.state.blessingBuffs[this.state.playerSide], this.state.season);
    hero.visibleStats = calculateVisibleStats(hero);

    hero.currentHP = this.adjustHP(oldMaxHP, hero);

    temp[this.state.playerSide][this.state.heroIndex] = hero;

    this.setState({heroList: temp});
    this.setState({selectedMember: temp[this.state.playerSide][this.state.heroIndex] });


  }

  onAllySupportChange(e){
    var temp = this.state.heroList;
    let hero = temp[this.state.playerSide][this.state.heroIndex];

    hero.allySupport = e;

    hero.stats = calculateStats(hero, this.state.fortLevel, this.state.blessingBuffs[this.state.playerSide], this.state.season); //might not need a stat calc since it is combat buff

    temp[this.state.playerSide][this.state.heroIndex] = hero;

    this.setState({heroList: temp});
    this.setState({selectedMember: temp[this.state.playerSide][this.state.heroIndex] });


  }

  onFortLevelChange(e){

    this.setState({fortLevel: Math.max(-20, Math.min(Number(e.target.value), 20 ) ) }); 

    let updateHeroList = this.state.heroList;

    updateHeroList = this.recalculateAllHeroStats(updateHeroList,  Number(e.target.value), this.state.blessingBuffs, this.state.season);


    this.setState({heroList: updateHeroList});
    
    this.setState({selectedMember: updateHeroList[this.state.playerSide][this.state.heroIndex] }); //update the selectedHero according to changed level //todo

  }

  onTurnChange(e){

    this.setState({currentTurn: Number(e.target.value)  }); 


  }

  onSeasonChange(e, type){
    var temp = this.state.season;
    temp[type] = e.target.value;
    
    this.setState({season: temp});

    let seasonHeroList = this.state.heroList;


    seasonHeroList = this.recalculateAllHeroStats(seasonHeroList, this.state.fortLevel, this.state.blessingBuffs, temp); //update all heroes with new seasons

    this.setState({heroList: seasonHeroList });
    this.setState({selectedMember: seasonHeroList[this.state.playerSide][this.state.heroIndex] });


  }


  onHPChange(e){

    let temp = this.state.heroList;
    temp[this.state.playerSide][this.state.heroIndex].currentHP = Math.min(Number(e.target.value),  temp[this.state.playerSide][this.state.heroIndex].stats.hp) ;
    this.setState({heroList: temp});
    this.setState({selectedMember: temp[this.state.playerSide][this.state.heroIndex] }); //update the selectedHero according to changed level //todo

  }

  onSpecialChargeChange(e){
    let temp = this.state.heroList;
    temp[this.state.playerSide][this.state.heroIndex].special.charge = Math.min(Number(e.target.value), temp[this.state.playerSide][this.state.heroIndex].special.cd);
    this.setState({heroList: temp});
    this.setState({selectedMember: temp[this.state.playerSide][this.state.heroIndex] }); 

  }

  onSelectedStatusChange(e, type){

    if (type === "statusBuff"){
      this.setState({selectedStatusBuff: e.target.value});
    } else if (type === "statusEffect"){
      this.setState({selectedStatusEffect: e.target.value});
    }

  }

  onStatusChange(e, type){

    let temp = this.state.heroList;
    

    let statusValue = 0;
    if (e.target.checked){ //if box is checked
      statusValue = 1;
    }


    if (type === "statusBuff"){
      temp[this.state.playerSide][this.state.heroIndex].statusBuff[this.state.selectedStatusBuff] = statusValue;
    } else if (type === "statusEffect"){
      temp[this.state.playerSide][this.state.heroIndex].statusEffect[this.state.selectedStatusEffect] = statusValue;
    }

    this.setState({heroList: temp});
    this.setState({selectedMember: temp[this.state.playerSide][this.state.heroIndex] }); 

  }

  getFilledPositions(){ //get positions that are occupied by a hero
    let positions = [];
    let temp = this.state.heroList["1"].concat(this.state.heroList["2"]); //merge two lists
    
    // eslint-disable-next-line
    for (let x of temp){
      if (x.position>=0)
        positions.push(x.position);
    }


    return positions
  }


  //drag Team member - the team elements
  dragTeamMember(ev){
    ev.dataTransfer.setData("text", ev.target.id ); //Gets the id, which should be holding the hero struct

    let dragData = JSON.parse(ev.target.id); //convert the target's text to an hero object
    this.setState({draggedHero: dragData});
    this.setState({draggedHeroOrg: JSON.parse(ev.target.id) }); //make a second deep copy
  }
  dragOverTeamMember(ev){
    ev.preventDefault();
  }

  //This handles dropping team members on the side panel. Dropping members on another will swap them
  dropTeamMember(ev){
    ev.preventDefault();
    let dragData = JSON.parse(ev.dataTransfer.getData("text"));


   // let drag = this.indexToSideIndex(dragData.listIndex);

    let dragIndex = dragData.listIndex;
    let dragSide = dragData.side;

    let dropData = JSON.parse(ev.target.id);

    //let drop = this.indexToSideIndex(dropData.listIndex);

    let dropIndex = dropData.listIndex;
    let dropSide = dropData.side;

    let temp = this.state.heroList;

    //temp to hold the dragged member
    let dragTemp = temp[dragSide][dragIndex];

    //replace the dragged member with the member in dropped location
    temp[dragSide][dragIndex] = temp[dropSide][dropIndex];

    //put the dragged member into the dropped location
    temp[dropSide][dropIndex] = dragTemp;

    //they have swapped and need their listIndex updated - they are the same because they have swapped
    temp[dragSide][dragIndex].listIndex = dragData.listIndex;
    temp[dropSide][dropIndex].listIndex = dropData.listIndex;

    //also update sides
    temp[dragSide][dragIndex].side = dragData.side;
    temp[dropSide][dropIndex].side = dropData.side;

    this.setState({heroList: temp});

    this.updateHero(dropSide, dropIndex);
    this.setState({heroIndex: dropIndex});
    this.setState({playerSide: dropSide})

  }




  //the board elements
  dragBoardMember(ev){

    ev.dataTransfer.setData("text", ev.target.id ); //id is the hero struct 

    let dragData = JSON.parse(ev.target.id); //convert the target's text to an hero object
    dragData.initiating = true;

    let oldHero = heroData[dragData.heroID.value];
    let move = this.getMovement(oldHero.movetype);

    //increase movement by one if they have mobility buff
    if (dragData.statusBuff["mobility+"] > 0){
      move++; 
    }


    let assist = -1;


    if (dragData.assist.range !== null)
      assist = dragData.assist.range;


    let pos = dragData.position;

    //these lists contain positions that have those actions available
    let movementList = [];
    let assistList = [];
    let attackList = [];
    let warpList = []; //contains positions that can be warped to


    for (let i = 0; i < 48; i++) { //rows
      if (getDistance(pos, i) <= move && this.props.G.cells[i] === null ){
        movementList.push(i);
      } else if (this.props.G.cells[i] !== null && dragData.position !== i){ //if there is a hero and is not themselves
        if (getDistance(pos,i) === assist && this.props.G.cells[i].side === dragData.side) //in range of assist and same side
          assistList.push(i);
        else if (getDistance(pos,i) === dragData.range && this.props.G.cells[i].side !== dragData.side) //in range of attack and opposite sides
          attackList.push(i);
      }
    }

    let warpTargets = this.getWarpTargets(this.state.heroList[dragData.side], dragData); //get the heroes you can warp to (as positions)


      //get adjacent
    let warpSpaces = this.getAdjacentSpaces(warpTargets); //set the warpspaces as the spaces adjacent to the warp targets

    //adds the warp spaces that are empty to the warp list 
    for (let x of warpSpaces){

      if (this.props.G.cells[x] === null && !movementList.includes(x) ){//space is empty and is not already a movement position
        warpList.push(x);
      }

    }



    this.setState({draggedHero: dragData});
    this.setState({draggedHeroOrg: Object.assign({}, dragData) });
    this.setState({availableWarp: warpList});
    this.setState({availableMovement: movementList});
    this.setState({availableAssist: assistList});
    this.setState({availableAttack: attackList});



  }


  getAdjacentSpaces(warpPositions){

    let spaces = [];

    for (let x of warpPositions){

      //left
      if ( (x % 6) - 1 >= 0 && !spaces.includes(x - 1) ){ //get the column number and check if it is not the left-most column
        spaces.push(x - 1);
      }
      //right
      if ( (x % 6) + 1 <= 5 && !spaces.includes(x + 1) ){ //get the column number and check if it is not the right-most column
        spaces.push(x + 1);
      }
      //up
      if ( Math.floor(x / 6) - 1 >= 0 && !spaces.includes(x -6) ){ //get the row number and check if it is not the top-most column
        spaces.push(x - 6);
      }
      //down
      if ( Math.floor(x / 6) + 1 <= 7 && !spaces.includes(x + 6) ){ //get the row number and check if it is not the bottom-most column
        spaces.push(x + 6);
      }
    }
    return spaces;



  }

    //"effect": {"condition": [["hp", "greater", 1]], "range": 2, "allyReq": {"type": "allyInfo", "key": "movetype", "req": ["Infantry", "Cavalry", "Armored"] } },
  getWarpTargets(allyList, owner ){
    let warpTargets = [];


    let allyListValid = []; //copy of list that only has valid heroes (not dead and on the board)
    for (let x in allyList){
      if (allyList[x].position >= 0 && allyList[x].currentHP > 0){
        allyListValid.push(allyList[x]);
      }
    } 

    if (owner.statusBuff.airOrders > 0){
      owner.warp.push({"allyReq": [["distanceCheck", 2]] } );

    }


    for (let x of owner.warp){ //loop through all warp effects

      if (x !== null){

        if ( !("condition" in x) || ( "condition" in x && checkCondition(this.state.heroList, x.condition, owner, owner)) ){ //first check if they meet condition to get warp effect

          let allyReq = x.allyReq;

          let passedAllyList = this.heroReqCheck(owner, allyListValid, allyReq); //Get the list of allies that pass the req check


          for (let y of passedAllyList){

            if (!warpTargets.includes(y.position)){
              warpTargets.push(y.position);
            }

          }




        } //heroList, condition, owner, enemy



      } //if no warp effects, then no targets 

    } //end loop through effect





    return warpTargets;

  }

  checkConditionHero(owner, condition, heroList){
    return function(other){

        return checkCondition(heroList, condition, owner, other);
    }
  }

  //given an list of allies and a requirement object, return a list of heroes that meet the requirements
  //loop through given list of allies, and remove/filter any that do that pass the requirement
  //do we want to do it by hero references or 
  heroReqCheck(owner, teamList, heroReq){

    let filteredList = [];//[...allyList]; //copy of allyList

    //for (let x of allyReq){ //loop through conditional list, then for each hero, if hero passes conditional 
      //console.log(x);
    filteredList = teamList.filter(this.checkConditionHero(owner, heroReq, this.state.heroList) ); //filter out 
      //console.log(filteredList);
    //}

    //checkCondition(heroList, x.condition, owner, enemy, this.state.currentTurn);

    return filteredList;
  }


  dragOverBoard(ev){
    ev.preventDefault();


    let dropPosition = ev.target.id;


    if (dropPosition === null){
      return;
    
    //if the spot has a hero, convert that hero to an ID

    } else if (Number.isNaN(parseInt(dropPosition)) ){

      dropPosition = JSON.parse(dropPosition).position;
    } else{
      dropPosition = parseInt(dropPosition);
    }


    let cellContent = this.props.G.cells[dropPosition];


    //check if cell has a hero and if it is on opposite side
    if (cellContent !==null && this.state.draggedHero.side !== cellContent.side){

      //if it is not the same draggedOver as before or if there was none before for battle forecast
      if ( (this.state.draggedOver !== null && this.state.draggedOver.position !== dropPosition) || this.state.draggedOver === null ) {

        let draggedOverHero = JSON.parse(JSON.stringify(this.props.G.cells[dropPosition]) ); // copies hero
        let draggedHero = JSON.parse(JSON.stringify(this.state.draggedHeroOrg)); //get the original dragged hero


        let preBattleDamage = -1;
        let orgHP = draggedOverHero.currentHP;

        //check if attacker is using an aoe special and if it is charged
        if (draggedHero.special.type === "pre-battle" && draggedHero.special.charge === 0){
          //do aoe

          let damageType = getDamageType(heroData[draggedHero.heroID.value].weapontype, draggedHero, draggedOverHero);

          ///// special trigger effects
          //check 
          //let oldSpecialTrigger =  Object.assign({}, draggedHero.combatEffects.specialTrigger); //get copy of the special trigger effects

          
          this.getVariablePreCombat(draggedHero, draggedOverHero);
          this.getVariablePreCombat(draggedOverHero, draggedHero);

          let onSpecialDamage = 0;
          let trueDamage = 0;

          for (let i of draggedHero.onSpecial){ //loop through each on move assist effect on the assister
            if (i !== null){

              for (let j in i){
                if (j === "damage"){


                  let extraDamage = getSpecialDamage(i, draggedHero, draggedOverHero, this.state.heroList, damageType);


                  if (i.damage[3] === "trueDamage"){
                    trueDamage+= extraDamage;
                  } else if (i.damage[3] === "specialDamage" ){
                    onSpecialDamage+= extraDamage
                  }


                } //end for damage
              } //end for i



            }

          } //end for onSpecial

          getConditionalSpecial(draggedHero, draggedOverHero, this.state.heroList);

          trueDamage+= draggedHero.combatEffects.specialTrueDamage; 
          //draggedHero.combatEffects.specialTrigger = oldSpecialTrigger; //revert to original


          let damageReduction = draggedOverHero.combatEffects.preBattleReduction;


          preBattleDamage = Math.trunc(  (draggedHero.visibleStats.atk - draggedOverHero.visibleStats[damageType]) * draggedHero.special.effect.factor) + onSpecialDamage + trueDamage;

          preBattleDamage = preBattleDamage - Math.trunc( preBattleDamage - preBattleDamage * damageReduction );

          //remove any effects from conditional specials (before any changes to the dragged hero is applied so that the same conditions pass)
          removeConditionalSpecial(draggedHero, draggedOverHero, this.state.heroList);

          draggedOverHero.currentHP = Math.max(1, draggedOverHero.currentHP - preBattleDamage); 

          draggedHero.special.charge = draggedHero.special.cd;
          draggedHero.specialActivated = true;

        } 



        Object.keys(draggedHero.combatEffects.stats).forEach((key, i) => {
          draggedHero.combatEffects.stats[key]+= Math.trunc(draggedHero.buff[key] * draggedHero.combatEffects.bonusDouble);
        });

        this.getVariableStats(draggedHero, draggedOverHero);
        this.getVariableStats(draggedOverHero, draggedHero);




        this.getConditionalEffects(draggedHero, draggedOverHero);
        this.getConditionalEffects(draggedOverHero, draggedHero);

        draggedHero.combatStats = calculateCombatStats(draggedHero, draggedOverHero);
        draggedOverHero.combatStats = calculateCombatStats(draggedOverHero, draggedHero);




        this.getConditionalCombat(draggedHero, draggedOverHero);
        this.getConditionalCombat(draggedOverHero, draggedHero);


        this.getVariableCombat(draggedHero, draggedOverHero);
        this.getVariableCombat(draggedOverHero, draggedHero);


        this.setState({draggedHero: draggedHero});
        this.setState({draggedOverOriginalHP: orgHP});
        this.setState({preBattleDamage: preBattleDamage});

        this.setState({draggedOver: draggedOverHero}); //setting dragedOver will activate the battlewindow to calculate battle forecast


        //TODO add an extra state that is a list of spaces if aoe special would be activated - and a sub list of those spaces of the new hp values of any heroes that would be affected
        //e.g. have a list of numbers indicating spaces affected. for each space, also have a corresponding text which will be "" if no hero is there and their new hp if otherwise
      }


    }

  }



  getConditionalCombat(owner, enemy){ //not used currently


    //Conditionals
    for (let x of owner.conditionalCombat){

      if (x !== null && checkCondition(this.state.heroList, x.condition, owner, enemy, this.state.currentTurn)){ //if condition is true, then provide the rest of the effects

        for (let y in x){ //loop through 
          if (y !== "condition" && y !== "type"){ //everything else should be combat effects
            owner.combatEffects[y]+= x[y]; 
          }


        } //end loop through gained effects



      } //end if condition true

    } //end for 
  }

  getConditionalEffects(owner, enemy){


    //Conditionals
    for (let x of owner.conditionalEffects){

      if (x !== null && checkCondition(this.state.heroList, x.condition, owner, enemy, this.state.currentTurn)){ //if condition is true, then provide the rest of the effects

        for (let y in x){ //loop through 

          if (y === "statBuff"){

            let buffs = x.statBuff;
            Object.keys(buffs).forEach((key, i) => {
              owner.combatEffects.stats[key]+= buffs[key]; //apply highest buff
            });


          } else if (y === "penaltyNeutralize"){

            let neutralized = x.penaltyNeutralize;

            for (let i of neutralized){
              owner.combatEffects.penaltyNeutralize[i]++; 
            }


          } else if (y === "buffNeutralize"){

            let neutralized = x.buffNeutralize;

            for (let i of neutralized){
              owner.combatEffects.buffNeutralize[i]++; 
            }


          } else if (y === "lull"){

            let lullStats = x.lull;
            for (let i in lullStats){
              owner.combatEffects.lull[i]+= lullStats[i];
            }

          } else if (y === "onAttack"){

            // for (let i in x.onAttack){
            //   owner.combatEffects[i]+= x.onAttack[i]; // onAttack should only give onAttack combat effects
            // }
            //for (let i in x.onAttack){
              owner.onAttack.push(x.onAttack); //[i]+= x.onAttack[i]; // onAttack should only give onAttack combat effects
            //}

          } else if (y === "postCombat"){
            owner.postCombat.push(x.postCombat);

          
          } else if (y === "variableEffect"){

            for (let i of x.variableEffect){
              if (i.type === "variableStats"){
                owner.variableStats.push(i); //effect should contain the conditional list
              } else if (i.type === "variableCombat"){
                owner.variableCombat.push(i);
              } else if (i.type === "variablePreCombat"){
                owner.variablePreCombat.push(i);
              }



            }

          } else if (["damageReduction", "consecutiveReduction", "firstReduction", "preBattleReduction", "followUpReduction"].includes(y) ){
            owner.combatEffects[y]*= x[y];


          } else if (y !== "condition" && y !== "type"){ //everything else should be combat effects
            owner.combatEffects[y]+= x[y]; 
          }


        } //end loop through gained effects



      } //end if condition true

    } //end for 
  }

  getVariableStats(owner, enemy){

    for (let x of owner.variableStats){

      if (x !== null ){ //if condition is true, then provide the rest of the effects


        let buffs =  calculateVariableEffect(this.state.heroList, x, owner, enemy);
        Object.keys(buffs).forEach((key, i) => {
          owner.combatEffects.stats[key]+= buffs[key];
        });

      } //end if condition true

    } //end for 
  }


  getVariableCombat(owner, enemy){

    for (let x of owner.variableCombat){

      if (x !== null ){ //if condition is true, then provide the rest of the effects


        let effectList = calculateVariableCombat(this.state.heroList, x, owner, enemy);

        for (let key in effectList){
          
          if (["damageReduction", "consecutiveReduction", "firstReduction", "preBattleReduction", "followUpReduction"].includes(key) ){

            owner.combatEffects[key]*= effectList[key];


          } else if (key === "lull"){

            let lullStats = effectList.lull;
            for (let i in lullStats){
              owner.combatEffects.lull[i]+= lullStats[i];
            }



          } else {

          
          owner.combatEffects[key]+= effectList[key];
          
          }

        }
        //});

      } //end if condition true

    } //end for 
  }

  getVariablePreCombat(owner, enemy){

    for (let x of owner.variablePreCombat){

      if (x !== null ){ //if condition is true, then provide the rest of the effects


        let effectList = calculateVariableCombat(this.state.heroList, x, owner, enemy);
        //Object.keys(effectList).forEach((key, i) => {
        for (let key in effectList){
          
          if (["damageReduction", "consecutiveReduction", "firstReduction", "preBattleReduction", "followUpReduction"].includes(key) ){

            owner.combatEffects[key]*= effectList[key];

          } else {

          
          owner.combatEffects[key]+= effectList[key];
          
          }

        }
        //});

      } //end if condition true

    } //end for 
  }

  dragEnd(ev){
    ev.dataTransfer.clearData();
    this.setState({availableMovement: []});
    this.setState({availableWarp: []});
    this.setState({availableAssist: []});
    this.setState({availableAttack: []});

    this.setState({draggedOver: null});
    this.setState({draggedHero: null});
    this.setState({draggedHeroOrg: null});
    this.setState({draggedOverOriginalHP: 0});
    this.setState({preBattleDamage: -1});



  }

  dropBoardMember(ev){
    ev.preventDefault();

    let dragData = this.state.draggedHero;//JSON.parse(ev.dataTransfer.getData("text"));
    //dragData.initiating = true; //held heroes are initiating
    //let drag = this.indexToSideIndex(dragData.listIndex);

    let dragIndex = dragData.listIndex; //the index of that team
    let dragSide = dragData.side; //the team dragged is on

    // let dragIndex = dragData.index;
    // let dragSide = dragData.side;

    let dropPosition = ev.target.id;

    //if the spot has a hero, convert that hero to an ID
    if (Number.isNaN(parseInt(dropPosition)) ){

      dropPosition = JSON.parse(dropPosition).position;
    } else{
      dropPosition = parseInt(dropPosition);
    }

    let temp = this.state.heroList;




    //if spot is already filled initiate assist and later battle
    if (this.props.G.cells[dropPosition] !==null){


      let dropIndex = this.props.G.cells[dropPosition].listIndex;
      let dropSide = this.props.G.cells[dropPosition].side;

      //let tempOrg = temp;


      //if (this.CheckAdjacent(dragData.position, this.props.G.cells[dropPosition].position )){
        //Check if in range for assist and they are on the same side
      if (getDistance(dragData.position, this.props.G.cells[dropPosition].position) === dragData.assist.range && dragData.side === this.props.G.cells[dropPosition].side ){


        //Note - These apply functions currently use a copy of the the assister (drag data) and assistee (dropPosition in cell list) 
        //Only one change is done at a time for the most part so this is fine, but for movement heal, it applies two effects, so the applyHealAssist portion uses the updated assister
        if (dragData.assist.type === "movement"){

          let orgAssisterPos = temp[dragSide][dragIndex].position;
          let orgAssisteePos = temp[dropSide][dropIndex].position;
          temp = this.applyMovementAssist(temp, dragData, this.props.G.cells[dropPosition], dragData.assist.effect); //should update temp accordingly

          temp[dragSide][dragIndex].moveAssistSuccess = false; //reset value

          //clear initial positions of assister/assistee
          this.props.G.cells[orgAssisterPos] = null;
          this.props.G.cells[orgAssisteePos] = null;

          //move the assistee/assister to their new positions 
          this.props.G.cells[temp[dragSide][dragIndex].position] = temp[dragSide][dragIndex];
          this.props.G.cells[temp[dropSide][dropIndex].position] = temp[dropSide][dropIndex];



        } else if (dragData.assist.type === "rally"){
          temp = this.applyRallyAssist(temp, dragData, this.props.G.cells[dropPosition], dragData.assist.effect);


        } else if (dragData.assist.type === "health"){
          temp = this.applyHealthAssist(temp, dragData, this.props.G.cells[dropPosition], dragData.assist.effect);
          
        } else if (dragData.assist.type === "heal"){
          temp = this.applyHealAssist(temp, dragData, this.props.G.cells[dropPosition], dragData.assist.effect);
          
        } else if (dragData.assist.type === "dance"){
          temp = this.applyDanceAssist(temp, dragData, this.props.G.cells[dropPosition]);

        } else if (dragData.assist.type === "movement-heal"){

          //apply movement
          //save original positions to clear out later
          let orgAssisterPos = temp[dragSide][dragIndex].position;
          let orgAssisteePos = temp[dropSide][dropIndex].position;
          temp = this.applyMovementAssist(temp, dragData, this.props.G.cells[dropPosition], dragData.assist.effect); //should update temp accordingly


          //apply heal
          temp = this.applyHealAssist(temp, temp[dragSide][dragIndex], this.props.G.cells[dropPosition], dragData.assist.effect);

          temp[dragSide][dragIndex].moveAssistSuccess = false; //reset value

          //clear initial positions of assister/assistee
          this.props.G.cells[orgAssisterPos] = null;
          this.props.G.cells[orgAssisteePos] = null;

          //move the assistee/assister to their new positions 
          this.props.G.cells[temp[dragSide][dragIndex].position] = temp[dragSide][dragIndex];
          this.props.G.cells[temp[dropSide][dropIndex].position] = temp[dropSide][dropIndex];



        }

      //Check if in range for attack and if they are on the same side
      } else if (getDistance(dragData.position, this.props.G.cells[dropPosition].position) === dragData.range && dragData.side !== this.props.G.cells[dropPosition].side ){
        let orgAttackerPos = temp[dragSide][dragIndex].position;
        let orgDefenderPos = temp[dropSide][dropIndex].position;


        //temp = DoBattle(temp, dragData, this.props.G.cells[dropPosition]);
        temp = doBattle(temp, dragData, this.state.draggedOver, this.props.G.cells);

        //clear initial positions of assister/assistee
        this.props.G.cells[orgAttackerPos] = null;
        this.props.G.cells[orgDefenderPos] = null;

        //move the assistee/assister to their new positions 
        this.props.G.cells[temp[dragSide][dragIndex].position] = temp[dragSide][dragIndex];
        this.props.G.cells[temp[dropSide][dropIndex].position] = temp[dropSide][dropIndex];

      }




      //An action has occured which is either an assist or battle. Buffs/debuffs usually go off after these actions so visible stats should be recalculated

      temp = this.recalculateAllVisibleStats(temp);

      this.setState({heroList: temp});
      this.selectNewMember(dragSide, dragIndex);

      //this.setState({selectedMember: temp[this.state.playerSide][this.state.heroIndex] }); 



    } else { //regular movement



      //remove old from board
      this.props.G.cells[temp[dragSide][dragIndex].position] = null;
      

      //update for new position
      this.props.G.cells[dropPosition] = temp[dragSide][dragIndex]; //update in gameboard
      temp[dragSide][dragIndex].position = dropPosition; //update in team list


      this.setState({heroList: temp});
      this.selectNewMember(dragSide, dragIndex);
      //this.updateHero(dropSide, dropData);
      //this.setState({selectedMember: temp[dragSide][dragIndex] });
    }

    this.dragEnd(ev);

  }

  //Given an index, get the side and index (for that side)
  indexToSideIndex(listIndex){

    let newIndex = 0;
    let newSide = "";

    if (listIndex>=5){
      newIndex = listIndex - 5;
      newSide = "2"; 
    } else{
      newIndex = listIndex;
      newSide = "1";
    }


    return {side:  newSide, teamIndex: newIndex};

  }

  //update the stats of the given team list - should be with new blessing buffs
  recalculateTeamHeroStats(currentTeamList, newblessingBuffs){ //newFortLevel, newblessingBuffs, newSeasons){
    let tempTeam = currentTeamList;
    Object.keys(tempTeam).forEach((memberKey, j) => { //for each member

      let oldMaxHP = tempTeam[memberKey].stats.hp;

      tempTeam[memberKey].stats = calculateStats(tempTeam[memberKey], this.state.fortLevel, newblessingBuffs, this.state.season); //new stats 

      tempTeam[memberKey].currentHP = this.adjustHP(oldMaxHP, tempTeam[memberKey]);

      tempTeam[memberKey].visibleStats = calculateVisibleStats(tempTeam[memberKey]); //recalculate visible stats

    });
    return tempTeam;

  }

  //get an updated list of heroes and update all of their stats
  recalculateAllHeroStats(currentHeroList, newFortLevel, newblessingBuffs, newSeasons){ 
    let tempList = currentHeroList;

    Object.keys(tempList).forEach((key, i) => { //for each team
        let tempTeam = tempList[key]; //copy of team to be modified

        Object.keys(tempTeam).forEach((memberKey, j) => { //for each member

          let oldMaxHP = tempTeam[memberKey].stats.hp;
          tempTeam[memberKey].stats = calculateStats(tempTeam[memberKey], newFortLevel, newblessingBuffs[key], newSeasons); //new stats 

          tempTeam[memberKey].currentHP = this.adjustHP(oldMaxHP, tempTeam[memberKey]);

          tempTeam[memberKey].visibleStats = calculateVisibleStats(tempTeam[memberKey]); //recalculate visible stats

        });

        tempList[key] = tempTeam; //update the team list
    });

    
    return tempList; //the heroList with stats recalculated
  }

  recalculateAllVisibleStats(currentHeroList){

    let tempList = currentHeroList;

    Object.keys(tempList).forEach((key, i) => { //for each team
        let tempTeam = tempList[key]; //copy of team to be modified

        Object.keys(tempTeam).forEach((memberKey, j) => { //for each member

          tempTeam[memberKey].visibleStats = calculateVisibleStats(tempTeam[memberKey]); //recalculate visible stats

        });
        tempList[key] = tempTeam;
    });

    return tempList;
  }


  applyMovementAssist(updatedHeroList, assister, assistee, effect){

    let list = updatedHeroList;

    let participantIDs = [assister.id, assistee.id]; //their ids (to uniquely identify them)
    //original location of both heroes
    // let assisterPos = positionToRowColumn(assister.position);
    // let assisteePos = positionToRowColumn(assistee.position);


    //Calculate row column positions from assist
    let newPositions = calculateMovementEffect(assister, assistee, effect);

    let assisterPos = newPositions.owner;
    let assisteePos = newPositions.other;
    let assisteeAlt = newPositions.otherAlt;
    

    //convert back to positions
    let newAssisterPos = rowColumnToPosition(newPositions.owner);
    let newAssisteePos = rowColumnToPosition(newPositions.other);

    //The above values can still be invalid if out of bounds
    //Battle does not have access to the board, but does it need it?


    // if (assisterPos[1] > 5 || assisterPos[1] < 0 || assisteePos[1] > 5 || assisteePos[1] < 0 //column out of bounds
    //   || assisterPos[0] > 7 || assisterPos[0] < 0 || assisteePos[0] > 7 || assisteePos[0] < 0) { //row out of bounds


    //   return updatedHeroList; //return original list

    // } else if (this.props.G.cells[newAssisteePos] !== null &&  !participantIDs.includes(this.props.G.cells[newAssisteePos].id) ){ //new assistee position is occupied by other hero
    //   return updatedHeroList;

    // } else if (this.props.G.cells[newAssisterPos] !== null &&  !participantIDs.includes(this.props.G.cells[newAssisterPos].id) ){ //new assister position is occupied by other hero
    //   return updatedHeroList;

    if (checkValidMovement(assisterPos, assisteePos, assisteeAlt, participantIDs, this.props.G.cells) || checkValidMovement(assisterPos, assisteeAlt, [-1, -1], participantIDs, this.props.G.cells)  ){ //no issues with given movement positions

      if (!checkValidMovement(assisterPos, assisteePos, assisteeAlt, participantIDs, this.props.G.cells)) { //if only alt space was balid
        newAssisteePos = rowColumnToPosition(assisteeAlt); //use the alt position
      } 

      list[assister.side][assister.listIndex].position = newAssisterPos;
      list[assistee.side][assistee.listIndex].position = newAssisteePos;


      list[assister.side][assister.listIndex].moveAssistSuccess = true;


      for (let i of assister.onAssist){ //loop through each on move assist effect on the assister
        if (i !== null && i["type"] === "movement"){

          for (let j in i){ //
            if (j === "buff"){

              let buffs = i.buff;
              for (let key in buffs){
              
                assister.buff[key] = Math.max( assister.buff[key], buffs[key]); //apply highest buff
                assistee.buff[key] = Math.max( assistee.buff[key], buffs[key]); 
              }


            } else if (j === "debuff"){

              let range = i.range;
              let debuff = i.debuff;

              let heroesInRange = [];


              if (i["from"].includes("assister") ){
                heroesInRange = getDistantHeroes(updatedHeroList[this.getEnemySide(assister.side)], newAssisterPos, [], range);
              }

              if (i["from"].includes("assistee") ){
                heroesInRange = heroesInRange.concat(getDistantHeroes(updatedHeroList[this.getEnemySide(assistee.side)], newAssisteePos, [], range)); 
              }
             
              
              
              //loop through heroes
              for (let hero of heroesInRange){

                //loop through debuff values
                for (let key in debuff){

                  list[hero.side][hero.listIndex].debuff[key] = Math.max( list[hero.side][hero.listIndex].debuff[key], debuff[key]); //apply highest debuff

                }

              } //end hero in range


            }

          }



        }

      } //end for assister moveAssist

      for (let i of assistee.onAssist){ //loop through each on move assist effect on the assistee
        if (i !== null && i["type"] === "movement"){


          for (let j in i){ //
            if (j === "buff"){

              let buffs = i.buff;
              for (let key in buffs){
                assister.buff[key] = Math.max( assister.buff[key], buffs[key]); //apply highest buff
                assistee.buff[key] = Math.max( assistee.buff[key], buffs[key]); 
              }


            } else if (j === "debuff"){

              let range = i.range;
              let debuff = i.debuff;


              let heroesInRange = [];


              if (i["from"].includes("assister") ){
                heroesInRange = getDistantHeroes(updatedHeroList[this.getEnemySide(assister.side)], newAssisterPos, [], range);
              }

              if (i["from"].includes("assistee") ){
                heroesInRange = heroesInRange.concat(getDistantHeroes(updatedHeroList[this.getEnemySide(assistee.side)], newAssisteePos, [], range)); 
              }
             
              
              //loop through heroes
              for (let hero of heroesInRange){

                //loop through debuff values
                for (let key in debuff){

                  list[hero.side][hero.listIndex].debuff[key] = Math.max( list[hero.side][hero.listIndex].debuff[key], debuff[key]); //apply highest debuff

                }

              } //end hero in range


            }

          }



        }

      } //end for assistee moveAssist

      list[assister.side][assister.listIndex].buff = assister.buff;
      list[assistee.side][assistee.listIndex].buff = assistee.buff;

      return list;

    } else { //invalid movemnt, return original list
      return list;
    }


  }



  applyRallyAssist(updatedHeroList, assister, assistee, effect){
    //rally effects are lists whose elements are two element lists. For those two elements lists, the first is the stat buffed and the second is the amount of the buff
    //if the first element is just up, then the buff is applied to units around the assistee as well

    let list = updatedHeroList;
    let aoe = false;
    let buffs = {"atk": 0, "spd": 0, "def": 0, "res": 0};

    let rallyObject = effect.rally;

    let rallyKeys = Object.keys(rallyObject);


    //get the rally buff that will be applied
    for (var i = 0; i< rallyKeys.length; i++ ){
      if (rallyKeys[i] === "up" && rallyObject["up"] === 1){
        aoe = true;
      } else {
        buffs[rallyKeys[i]] =  rallyObject[rallyKeys[i]]; //apply number to the stat
      }

    }

    //apply buff to assistee

    Object.keys(buffs).forEach((key, i) => {
      assistee.buff[key] = Math.max( assistee.buff[key] ,buffs[key]); //apply highest buff
    });

    //apply the rally to 
    if (aoe){
      let inRangeAllies = getDistantHeroes(list[assistee.side.toString()], [assistee.position], [assister.position], 2);

      //apply buff to all allies in range
      for (let x of inRangeAllies){
        Object.keys(buffs).forEach((key, i) => {
          x.buff[key] = Math.max( x.buff[key] ,buffs[key]); //apply highest buff
        });

        list[x.side][x.listIndex] = x;
      }
      

    }

      for (let i of assister.onAssist){ //loop through each on rally effect on the assister
        if (i !== null && i["type"] === "rally"){

          for (let j in i){ //
    //"effect": {"type": "rally", "statusEffect": [], "debuff": {"atk": 3}, "from": ["owner"], "range": "cardinal"},
            if (j === "range"){ //range determines who is affected and is main identifier to apply this effect

              let affectedHeroes = [];

              if (i.range === "cardinal"){

                  if (i["from"].includes("owner") ){
                    affectedHeroes = this.getCardinalHeroPositions(assister.position, []);
                  }

                  if (i["from"].includes("ally") ){
                    affectedHeroes = affectedHeroes.concat( this.getCardinalHeroPositions(assistee.position, [...affectedHeroes, assister.position]) );
                  }

              } //check for cardinal range

              for (let k of affectedHeroes){ //apply debuffs and status effects to heroes in range
                let side = this.props.G.cells[k].side;
                let index = this.props.G.cells[k].listIndex;

                if (side !== assister.side){ //only apply if on enemy team

                  let debuffs = i.debuff;

                  for (let l in debuffs) {
                    list[side][index].debuff[l] = Math.max(  list[side][index].debuff[l], debuffs[l]); //apply highest buff

                  }

                  let statusEffects = i.statusEffect;

                  for (let l of statusEffects){
                    list[side][index].statusEffect[l]++; //apply the status effect
                  }

                }


              } //end apply for each affected hero

            } //end if range


          } //end j loop



        }

      } //end for assister onRally

      for (let i of assistee.onAssist){ //loop through each on rally effect on the assistee
        if (i !== null && i["type"] === "rally"){


          for (let j in i){ //
            if (j === "range"){ //range determines who is affected and is main identifier to apply this effect

              let affectedHeroes = [];

              if (i.range === "cardinal"){

                  if (i["from"].includes("owner") ){
                    affectedHeroes = this.getCardinalHeroPositions(assistee.position, []);
                  }

                  if (i["from"].includes("ally") ){
                    affectedHeroes = affectedHeroes.concat( this.getCardinalHeroPositions(assister.position, [...affectedHeroes, assistee.position]) );
                  }

              } //check for cardinal range

              for (let k of affectedHeroes){ //apply debuffs and status effects to heroes in range
                let side = this.props.G.cells[k].side;
                let index = this.props.G.cells[k].listIndex;

                if (side !== assistee.side){ //only apply if on enemy team

                  let debuffs = i.debuff;

                  for (let l in debuffs) {
                    list[side][index].debuff[l] = Math.max(  list[side][index].debuff[l], debuffs[l]); //apply highest buff

                  }

                  let statusEffects = i.statusEffect;

                  for (let l of statusEffects){
                    list[side][index].statusEffect[l]++; //apply the status effect
                  }

                }


              } //end apply for each affected hero

            } //end if range

          } //end for j



        }

      } //end for assistee onRally


    list[assistee.side][assistee.listIndex] = assistee;

    return list;


  }




  //from a position, get a list of heroes that are cardinal to the position (and get their positions)
  getCardinalHeroPositions(position, excluded){

    let cardinalList = [];

    let col = position; //start from position


    //checking west
    while ( (col % 6) - 1 >= 0){ //get col and reduce by and 
      col--;
      if (this.props.G.cells[col] !== null && !excluded.includes(this.props.G.cells[col].position) ){ //if a hero is in that space
        cardinalList.push(col);
      }

    }

    col = position;
    //checking east
    while ( (col % 6) + 1 <= 5){ //get col and reduce by and 
      col++;
      if (this.props.G.cells[col] !== null && !excluded.includes(this.props.G.cells[col].position) ){ //if a hero is in that space
        cardinalList.push(col);
      }

    }


    let row = position;

    //checking north
    while ( Math.floor(row / 6) - 1 >= 0){ //get col and reduce by and 
      row+= -6;

      if (this.props.G.cells[row] !== null && !excluded.includes(this.props.G.cells[row].position) ){ //if a hero is in that space
        cardinalList.push(row);
      }

    }

    row = position;
    //checking south
    while ( Math.floor(row / 6) + 1 <= 7){ //get col and reduce by and 
      row+= 6;

      if (this.props.G.cells[row] !== null && !excluded.includes(this.props.G.cells[row].position) ){ //if a hero is in that space
        cardinalList.push(row);
      }

    }
    //get left to right spaces

    return cardinalList;



  }

  applyHealthAssist(updatedHeroList, assister, assistee, effect){
    let list = updatedHeroList;

    let newAssisterHP = assister.currentHP;
    let newAssisteeHP = assistee.currentHP;

    if (effect.type === "swap"){ //reciprocal aid


      //set hp for assister
      newAssisterHP = Math.min(assistee.currentHP, assister.stats.hp); //keep hp below max

      //set hp for assistee
      newAssisteeHP = Math.min(assister.currentHP, assistee.stats.hp); //keep hp below max
      

    } else if(effect.type === "sacrifice"){

      //there are two things with sacrifice assists, the amount transferred and the amount healed.

      //transfer is hp loss
      //heal is amount gained

      let maxHeal = effect.healMax; //the amount transferred is capped



      let maxGive = assister.currentHP - 1; //can transfer until HP reaches 1
      let maxGet = assistee.stats.hp - assistee.currentHP; //can only transfer amount to fully heal

      let healAmount = Math.min(maxHeal, maxGive, maxGet); //the amount healed is the least of these three numbers
      let transferAmount = Math.max(healAmount, effect.transferMin); //amount transferred is the amount healed, or the minimum transferMin (because ardent sacrifice)

      if (maxGive < effect.transferMin){ //if the hp that can be transferred is less than the minimum heal, then do not apply assist and return list
        return list;
      }

      newAssisterHP = assister.currentHP - transferAmount;
      newAssisteeHP = assistee.currentHP + healAmount;


    }

    list[assistee.side][assistee.listIndex].currentHP = newAssisteeHP;
    list[assister.side][assister.listIndex].currentHP = newAssisterHP;

    return list;

  }

  applyHealAssist(updatedHeroList, assister, assistee, effect){
    let list = updatedHeroList;

    //full hp, assist does not go through. 
    //Also checks if has done a movement assist (e.g. rescue) in which case, the assist will go through (no healing should still occur in this case but special will activate)
    if (assistee.currentHP === assistee.stats.hp && !assister.moveAssistSuccess){ 

      return list;
    }

    let newAssisterHP = assister.currentHP;
    let newAssisteeHP = assistee.currentHP;


    //actual heal values to apply
    let assisterHeal = 0;
    let assisteeHeal = 0;
    // "effect": {"atk": 0.5, "min": 7, "mod": 0, "self": "martyr", "mod2": "martyr"},

    //minimum that will be healed
    let min = effect.min;
    //calculated healing amount
    let selfHeal = effect.selfHeal;

    let healCalc = Math.floor(assister.stats.atk * effect.atk) + effect.mod;


    if (effect.modifiers.includes("martyr")){
      healCalc += assister.stats.hp - assister.currentHP; //add to calculated healing amount, the damage on assister
      selfHeal = Math.floor( (assister.stats.hp - assister.currentHP)/2); //heal for half of damage on assister


    }

    assisteeHeal = Math.max(min, healCalc); //Get the highest of the two
    assisterHeal = selfHeal;

    // 20 /41 -> qualifies 
    // 40- 40
    if (effect.modifiers.includes("rehab")){ //rehab's bonus is applied after the maximum is found
      if (assistee.currentHP <= Math.trunc(assistee.stats.hp) * 0.5 ){ //hp must be <= 50%
        assisteeHeal += assistee.stats.hp - (2 * assistee.currentHP);
      }
    }

    let assisterSpecial = assister.special;

    let participantIDs = [assister.id, assistee.id];


    if (assisterSpecial.charge === 0 && assisterSpecial.type === "heal"){ //activate special

      //add flat healing amount from special (currently only imbue)
      if ("flatHeal" in assisterSpecial.effect){
        assisteeHeal+= assisterSpecial.effect.flatHeal;
      }

      if ("teamHeal" in assisterSpecial.effect){ //heal everyone in team except assister and assistee
        let side = assistee.side;

        for (let x of list[side]){ //for each member of side
          if (!participantIDs.includes(x.id) ){ //if x is not an assister/assistee

            //heal team according special
            list[side][x.listIndex].currentHP = Math.min(list[side][x.listIndex].currentHP + assisterSpecial.effect.teamHeal, list[side][x.listIndex].stats.hp);

          }
        } //end for
      } //end teamHeal


      if ("partyBuff" in assisterSpecial.effect){
        let side = assistee.side;
        let buffs = assisterSpecial.effect.partyBuff;
        for (let x of list[side]){ //for each member of side

          Object.keys(buffs).forEach((key, i) => {
            x.buff[key] = Math.max( x.buff[key] ,buffs[key]); //apply highest buff
          });

          list[side][x.listIndex] = x;

        }

      } //end buff

      assisterSpecial.charge = assisterSpecial.cd; //reset special
    } else{ //special not activated

      //special not fully charged and does not have nullCharge modifier
      if (assisterSpecial.charge >= 0 && !effect.modifiers.includes("nullCharge") ){
        assisterSpecial.charge = Math.max(0, assisterSpecial.charge - 1);
      }
    }

    //cut off healing  from going over max hp
    if (assistee.currentHP + assisteeHeal > assistee.stats.hp){
      assisteeHeal = assistee.stats.hp - assistee.currentHP;
    }

    for (let i of assister.onAssist){ //loop through each dance effect
      if (i !== null && i["type"] === "heal"){

        for (let j in i){ //
          if (j === "selfHeal"){
            assisterHeal+= Math.trunc(i[j] * assisteeHeal); //live to serve effect (heal assister according to the assistee's heal)

          }
        }



      }

    } //end for assister heal assist

    //cut off healing  from going over max hp
    if (assister.currentHP + assisterHeal > assister.stats.hp){
      assisterHeal = assister.stats.hp - assister.currentHP;
    }

    //set new HP values - Keep hp below max;
    newAssisteeHP = assistee.currentHP + assisteeHeal;
    newAssisterHP = assister.currentHP + assisterHeal;
    
    
   
    list[assister.side][assister.listIndex].special.charge = assisterSpecial.charge;

    list[assistee.side][assistee.listIndex].currentHP = newAssisteeHP;
    list[assister.side][assister.listIndex].currentHP = newAssisterHP;

    return list;

  }

  applyDanceAssist(updatedHeroList, assister, assistee){
    let list = updatedHeroList;

    if (assistee.end === true){
      list[assistee.side][assistee.listIndex].end = false;
    } else {
      return list;
    }

    
    for (let i of assister.onAssist){ //loop through each dance effect
      if (i !== null && i["type"] === "dance"){

        for (let j in i){ //
          if (j === "buff"){

            let buffs = i.buff;
            Object.keys(buffs).forEach((key, i) => {

              assistee.buff[key] = Math.max( assistee.buff[key], buffs[key]); //apply buff to assistee
            });


          } else if (j === "debuff"){

              let range = i.range;
              let debuff = i.debuff;

              let heroesInRange = [];


              if (i["from"].includes("assister") ){
                heroesInRange = getDistantHeroes(updatedHeroList[this.getEnemySide(assister.side)], assister.position, [], range);
              }

              if (i["from"].includes("assistee") ){
                heroesInRange = heroesInRange.concat(getDistantHeroes(updatedHeroList[this.getEnemySide(assistee.side)], assistee.position, [], range)); 
              }

              
              //loop through heroes
              for (let hero of heroesInRange){

                //loop through debuff values
                for (let key in debuff){

                  list[hero.side][hero.listIndex].debuff[key] = Math.max( list[hero.side][hero.listIndex].debuff[key], debuff[key]); //apply highest debuff

                }

              } //end hero in range


            }
        }



      }

    } //end for assister dance assist

    return list;


  }




  //Check if two positions are adjacent
  checkAdjacent(first, second){
   let firstRC = positionToRowColumn(first);
   let secondRC = positionToRowColumn(second);


    //if rows are the same, and column difference is one
    if (firstRC[0] === secondRC[0] && Math.abs(firstRC[1] - secondRC[1]) === 1){
      return true;
    } else if (firstRC[1] === secondRC[1] && Math.abs(firstRC[0] - secondRC[0]) === 1)
      return true;
    
    return false;

  }


  //






  //When max HP is changed, adjust current HP the same amount. Do not bring it below 0 though
  adjustHP(oldMax, updatedHero){

    let newHP = updatedHero.currentHP + updatedHero.stats.hp - oldMax;

    if (newHP < 0)
      return 0;
    else
      return newHP; 

  }

  getMovement(moveType){

    if (moveType === "Cavalry")
      return 3;
    else if (moveType === "Infantry" || moveType === "Flying")
      return 2;
    else if (moveType === "Armored")
      return 1;
    else
      return 0;
  }

  getEnemySide(side){

    if (side === "1"){
      return "2";
    } else {
      return "1";
    }
  }


  //checks if hero is on the board and not dead
  heroValid(hero){
    if (hero.position >= 0 && hero.currentHP > 0){
      return true;
    } else {
      return false;
    }

  }

  startTurn(){
    let side = this.state.playerSide;
    let tempList = this.state.heroList; //this is the copy that will be modified



    let enemySide = this.getEnemySide(side);
    // this["buff"] = {"atk": 0, "spd": 0, "def": 0, "res": 0}; //visible buffs
    // this["statusBuff"] = {};
    for (let i of tempList[side]){ 

      //These effects last for 1 turn which means there are reset at the start of the turn
      tempList[side][i.listIndex].buff = {"atk": 0, "spd": 0, "def": 0, "res": 0}; //reset buffs
      tempList[side][i.listIndex].statusBuff = {"bonusDouble": 0, "airOrders": 0, "mobility+": 0}; //reset status buffs

    }

    let heroList = JSON.parse(JSON.stringify(this.state.heroList)); //deep copy of heroList for reference (so that calculations are done at the same time)

    for (let i of heroList[side]){ //this.state.heroList[side]){ //loop through each hero


      if (i.position < 0 || i.currentHP <= 0){ continue;} //skip if hero is dead or not on the board

      //Turn Start skills

      for (let j of i.turnStart){ //loop through each turnstart abilities
        if (j === null || j === undefined) {continue;}

        if ( "condition" in j && !checkCondition(heroList, j.condition, i, i, this.state.currentTurn) ){ //check if condition has not been met skip
          continue;
        }

        for (let k in j){
          if (k === "chill"){

            let stats = j[k].stats;
            let debuff = j[k].debuff;

            let debuffList = [];
            let max = 0;

            for (let m of heroList[enemySide]){ //loop through enemy team
              let sum = 0;

              for (let n of stats){ //go through the stat list and get the summed value
                sum+= m.visibleStats[n];
              }

              if (sum === max){ // add to list of heroes to debuff
                debuffList.push(m.listIndex);
              } else if (sum > max && this.heroValid(m)){ //sum is greater than current, clear list and add
                debuffList = [];
                debuffList.push(m.listIndex); 
                max = sum;
              }


            } //end loop enemy team
            for (let m of debuffList){ //apply for each hero that have the highest sums
              for (let n of stats){ //apply for each applicable stat
                tempList[enemySide][m].debuff[n] = Math.max(tempList[enemySide][m].debuff[n], debuff); 
              }

            }


          } //end chill
          else if (k === "niflSeal"){ //nifl seal - check for lowest of a stat, then apply debuffs to that target (not neccessarily in same stat). Temp name for now

            let checkStats = j[k].checkStats;
            let debuff = j[k].debuff;
            let debuffStats = j[k].debuffStats;

            let debuffList = [];
            let min = 999;

            for (let m of heroList[enemySide]){ //loop through enemy team
              let sum = 0;

              for (let n of checkStats){ //go through the stat list and get the summed value
                sum+= m.visibleStats[n];
              }

              if (sum === min){ // add to list of heroes to debuff
                debuffList.push(m.listIndex);
              } else if (sum < min && this.heroValid(m)){ //sum is less than current, clear list and add
                debuffList = [];
                debuffList.push(m.listIndex); 
                min = sum;
              }


            } //end loop enemy team
            for (let m of debuffList){ //apply for each hero that have the highest sums
              for (let n of debuffStats){ //apply for each applicable stat
                tempList[enemySide][m].debuff[n] = Math.max(tempList[enemySide][m].debuff[n], debuff); 
              }

            }

          } else if (k === "renewal"){

            tempList[side][i.listIndex].currentHP = Math.min(tempList[side][i.listIndex].currentHP + j[k],  tempList[side][i.listIndex].stats.hp);


          } else if (k === "specialCount"){

            tempList[side][i.listIndex].special.charge = Math.max(tempList[side][i.listIndex].special.charge - j[k],  0); //reduce special charge by 1

          } else if (k === "sabotage"){
            let checkStat = j.sabotage.checkStats;
            let checkValue = i.visibleStats[checkStat] + j.sabotage.mod; //value to check against
            let debuffStats = j.sabotage.debuffStats; //stats to debuff
            let debuffStatuses = j.sabotage.debuffStatus;
            let debuff = j.sabotage.debuff; //how much to debuff stats

            if (checkStat === "hp"){
              checkValue = i.currentHP + j.sabotage.mod; 
            }

            let debuffList = [];
            for (let m of heroList[enemySide]){
              let enemyCheck = -1;
              if (checkStat === "hp"){
                enemyCheck = m.currentHP;
              } else {
                enemyCheck = m.visibleStats[checkStat];
              }

              if (enemyCheck <= checkValue && getDistantHeroes(heroList[enemySide], m.position, [], 1).length > 0 ){ //check if enemy fails stat check and is beside their ally
                debuffList.push(m.listIndex);


              }//end if
            }

            for (let m of debuffList){ //apply for each hero that meet sabotage reqs

              for (let n of debuffStats){ //apply for each applicable stat
                tempList[enemySide][m].debuff[n] = Math.max(tempList[enemySide][m].debuff[n], debuff); 
              } //end for

              for (let n of debuffStatuses){
                tempList[enemySide][m].statusEffect[n]++;
              }

            } //end loop debuff list

          } else if (k === "pulseTie"){


            let checkHP = i.currentHP;

            let debuffList = [];
            let min = 999;

            for (let m of heroList[enemySide]){ //loop through enemy team
            
              let currentHP = m.currentHP;


              //if not below owner's hp and special is charged, then skip to next enemy
              if (currentHP + j.pulseTie.hp > checkHP || m.special.charge !== 0){
                continue;
              }

              if (currentHP === min){ // add to list of heroes to debuff
                debuffList.push(m.listIndex);
              } else if (currentHP < min && this.heroValid(m)){ //sum is less than current, clear list and add
                debuffList = [];
                debuffList.push(m.listIndex); 
                min = currentHP;
              }
              //    this["special"] = {"cd": -10, "charge": -10};

            } //end loop enemy team
            for (let m of debuffList){ //apply for each hero in the list
              //set charged specials to given value or to their cd if it is less than the given value  
              tempList[enemySide][m].special.charge = Math.min(tempList[enemySide][m].special.cd, j.pulseTie.specialCharge); 

            }


          } else if (k === "buffList"){


            //for status buff, we can then buff those heroes instead
            let allyList = heroList[side];

            let allyListValid = []; //copy of list that only has valid heroes (not dead and on the board)
            for (let x in allyList){
              if (allyList[x].position >= 0 && allyList[x].currentHP > 0 ){
                allyListValid.push(allyList[x]);
              }
            } 

           // for (let m of heroList[side]){ //loop through friendly heroes

            let allyReq = j.allyReq;



            let passedAllyList = [];

            if ("allyReq" in j){
              passedAllyList = this.heroReqCheck(i, allyListValid, allyReq); //Get the list of allies that pass the req check


              for (let y of passedAllyList){

                if (y.id !== i.id){ //ally is not themselves


                  for (let x of j.buffList){ //loop through status buffs to apply

                    if (x === "statBuff"){
                      for (let m of j.buffStats){
                        tempList[y.side][y.listIndex].buff[m] = Math.max(tempList[y.side][y.listIndex].buff[m], j.buff); 
                      }



                    } else { //otherwise, it should be a status buff
                      tempList[y.side][y.listIndex].statusBuff[x]++; //give the status buff
                    }


                  }
                }

              } //end loop passedAllyList

            } //end ally req
            

            //if there is a requirement for the buff to apply to themselves
            if ("selfBuffReq" in j && checkCondition(heroList, j.selfBuffReq, i, i)){ 
              for (let x of j.buffList){
                  if (x === "statBuff"){
                    for (let m of j.buffStats){
                      tempList[i.side][i.listIndex].buff[m] = Math.max(tempList[i.side][i.listIndex].buff[m], j.buff); 
                    }



                  } else { //otherwise, it should be a status buff
                    tempList[i.side][i.listIndex].statusBuff[x]++; //give the status buff
                  }

              }
            } 

          } else if (k === "debuffList"){


            //for status buff, we can then buff those heroes instead
            let enemyList = heroList[enemySide];

            let enemyListValid = []; //copy of list that only has valid heroes (not dead and on the board)
            for (let x in enemyList){
              if (enemyList[x].position >= 0 && enemyList[x].currentHP > 0 ){
                enemyListValid.push(enemyList[x]);
              }
            } 



            let debuffReq = j.debuffReq;



            let passedEnemyList = [];

            if ("debuffReq" in j){
              passedEnemyList = this.heroReqCheck(i, enemyListValid, debuffReq); //Get the list of allies that pass the req check


              for (let y of passedEnemyList){

                if (y.id !== i.id){ //ally is not themselves


                  for (let x of j.debuffList){ //loop through status buffs to apply

                    if (x === "statDebuff"){ //if debuff key is stat debuffs

                      for (let m of j.debuffStats){ //loop through debuff stats

                        tempList[y.side][y.listIndex].debuff[m] = Math.max(tempList[y.side][y.listIndex].debuff[m], j.debuff); 


                      }


                    } else { //for status effects
                      tempList[y.side][y.listIndex].statusEffect[x]++; //give the status effect
                    }




                  }
                }

              } //end loop passedAllyList

            } //end ally req
            

            // //if there is a requirement for the buff to apply to themselves
            // if ("selfBuffReq" in j && checkCondition(heroList, j.selfBuffReq, i, i)){ 
            //   for (let x of j.debuffList){
            //     tempList[i.side][i.listIndex].statusBuff[x]++;
            //   }
            // } 



          } else if (k === "opening"){


            let stats = j[k].stats;
            let buff = j[k].buff;

            let buffList = [];
            let max = 0;

            for (let m of heroList[side]){ //loop through allied team

              if (m.id === i.id){ continue;} //skip owner

              let sum = 0;

              for (let n of stats){ //go through the stat list and get the summed value
                sum+= m.visibleStats[n];
              }

              if (sum === max){ // add to list of heroes to buff if tied with max
                buffList.push(m.listIndex);
              } else if (sum > max && this.heroValid(m)){ //sum is greater than current, clear list and add
                buffList = [];
                buffList.push(m.listIndex); 
                max = sum;
              }


            } //end loop allied team
            for (let m of buffList){ //apply for each hero that have the highest sums
              for (let n of stats){ //apply for each applicable stat
                tempList[side][m].buff[n] = Math.max(tempList[side][m].buff[n], buff); 
              }

            }

          } //end opening



        } //end k

      } //end j


    }

    this.setState({heroList: tempList }); //updates the hero list state

  } //end startTurn

  endTurn(){
    let tempList = this.state.heroList;

    //loop through each team
    for (let i in tempList){

      //loop through each hero on team
      for (let j of tempList[i]){

        tempList[i][j.listIndex].combatCount = 0; //reset their combat counts

        if (j.side === this.state.playerSide && !j.end){ //if on current side and has not finished their action yet
          tempList[i][j.listIndex].debuff = {"atk": 0, "spd": 0, "def": 0, "res": 0};
          tempList[i][j.listIndex].statusEffect = {"guard": 0, "panic": 0}; 

        }


      }

    } //end i

    //TODO
    //Loop through current team and check for heroes that have not waited yet
    //These heroes will need to reset their debuffs. 
    //Also change selected hero to first of the opposite side


    this.setState({heroList: tempList});
  }

  render() {


    //console.log(this.state.heroList);
    console.log(this.state.heroList[this.state.playerSide][this.state.heroIndex]);

    return (

      <div>
      <table align = 'center' >
      <tbody>
      <tr valign = 'top'>
        <td><TeamElement 
            name = "1" 
            gameState = {this.state} 
            selector = {this.selectNewMember}
            drag = {this.dragTeamMember}
            dragOver = {this.dragOverTeamMember}
            drop = {this.dropTeamMember} />
        </td>

        <td colSpan = "3">
          <Stats 
              gameState = {this.state} 
              levelChange = {this.onLevelsChange}
              heroChange = {this.onHeroChange}  
              buffChange = {this.onBuffChange}
              ivChange = {this.onIVChange}
              hpChange = {this.onHPChange}
              specialChargeChange = {this.onSpecialChargeChange}
              selectedStatusChange = {this.onSelectedStatusChange}
              statusChange = {this.onStatusChange} />
        </td>
        <td rowSpan = "2">
          <table className= "boardStyle" id="board" align = 'center'>
          <tbody>
            <Map
                gameState = {this.state}
                G = {this.props.G}
                filledPositions = {this.getFilledPositions}
                selectNewMember = {this.selectNewMember}
                dragOver = {this.dragOverBoard}
                dragStart = {this.dragBoardMember}
                drop = {this.dropBoardMember}
                dragEnd = {this.dragEnd} />


          </tbody>
          </table>
        </td>
      </tr>
      <tr valign = 'top'>
        
        <td><TeamElement 
            name = "2" 
            gameState = {this.state} 
            selector = {this.selectNewMember}
            drag = {this.dragTeamMember}
            dragOver = {this.dragOverTeamMember}
            drop = {this.dropTeamMember} />            
        </td>
        
        <td>
          <Skills
            gameState = {this.state}
            skillChange = {this.onSkillChange}
            maxFilterChange = {this.onMaxFilterChange}
            supportLevelChange = {this.onSupportLevelChange}
            allySupportChange = {this.onAllySupportChange}
            bonusChange = {this.onBonusChange}
            endChange = {this.onEndChange} />

        </td>

        <td>
          <Field  
            gameState = {this.state}
            fortChange = {this.onFortLevelChange}
            turnChange = {this.onTurnChange}
            seasonChange = {this.onSeasonChange} 
            startTurn = {this.startTurn}
            endTurn = {this.endTurn} />
          
        </td>

        <td>
          <BattleWindow
          gameState = {this.state}

          />

        </td>
      </tr>

      </tbody>
      </table>


      </div>
    );
  }



} //end board

function makeHeroStruct(){

  function hero(){
    this["id"] = arguments[0];
    this["listIndex"] = arguments[0] % 6; //index of the hero for the list of heroes
    this["level"] = 40;
    this["merge"] = 0;
    this["dragonflower"] = 0;
    this["heroID"] = {value: 0, label: ""};
    this["iv"] = {asset: "neutral", flaw: "neutral"};
    this["heroSkills"] = {"weapon": {value: "0", label: ""}, "assist": {value: "0", label: ""}, "special": {value: "0", label: ""}, 
                          "a": {value: "0", label: ""}, "b": {value: "0", label: ""}, "c": {value: "0", label: ""}, "seal": {value: "0", label: ""} //hero skills equipped
                        };

    this["side"] = (Math.floor(arguments[0] / 6) + 1).toString();
    // these are reset at the start of the hero's turn
    this["buff"] = {"atk": 0, "spd": 0, "def": 0, "res": 0}; //visible buffs
    this["statusBuff"] = {"bonusDouble": 0, "airOrders": 0, "mobility+": 0};

    //these are reset when the hero's action is taken (action is also considered taken if action was available but their turn ended)
    this["debuff"] = {"atk": 0, "spd": 0, "def": 0, "res": 0};
    this["statusEffect"] = {"guard": 0, "panic": 0}; //


    this["aura"] = {"atk": 0, "spd": 0, "def": 0, "res": 0}; //stats changed by auras
    
    this["rarity"] = 5;
    this["stats"] = {"hp": 0, "atk": 0, "spd": 0, "def": 0, "res": 0}; //the actual stats of the hero
    this["visibleStats"] = {"atk": 0, "spd": 0, "def": 0, "res": 0}; //the stats of the hero that is shown to the player in the actual game (stats + buffs/debuffs)
    this["combatStats"] = {"atk": 0, "spd": 0, "def": 0, "res": 0}; //the stats of the hero used for battle calculation (visibleStats + combat buffs/debuffs)


    this["summonerSupport"] = "None";
    this["allySupportLevel"] = "None";
    this["allySupport"] = {value: 0, label: ""};
    this["blessing"] = "None";
    this["position"] = -1;
    this["currentHP"] = 0;
    this["passive"] = {"hp": 0, "atk": 0, "spd": 0, "def": 0, "res": 0}; //set of stats from skills
    this["assist"] = {};
    this["special"] = {"cd": -10, "charge": -10};
    this["range"] = -1;
    this["bonus"] = false;
    this["end"] = false;
    this["effects"] = {"cdTrigger": 0};

    this["combatEffects"] = {"counter": 0, "double": 0, "enemyDouble": 0, "stopDouble": 0, "attackCharge": 1, "defenseCharge": 1, "guard": 0, "trueDamage": 0, "adaptive": 0, "sweep": 0,
      "brashAssault": 0, "desperation": 0, "vantage": 0, 
      "nullC": 0, "nullEnemyFollowUp": 0, "nullStopFollowUp": 0,
      "brave": 0, "enemyBrave": 0,
      "recoil": 0, "galeforce": 0,
      "wrathful": 0,
      "reflect": 0,
      "burn": 0,
      //"poison": 0, "pain": 0, "savageBlow": 0,
      "specialTrueDamage": 0, "specialFlatReduction": 0, "specialHeal": 0.0,
      "seal": [], "spiral": 0,
      "stats": {"atk": 0, "spd": 0, "def": 0, "res": 0},
      "lull": {"atk": 0, "spd": 0, "def": 0, "res": 0},
      "damageReduction": 1.0, "consecutiveReduction": 1.0, "firstReduction": 1.0, "preBattleReduction": 1.0, "followUpReduction": 1.0,
      "penaltyNeutralize": {"atk": 0, "spd": 0, "def": 0, "res": 0}, "buffNeutralize": {"atk": 0, "spd": 0, "def": 0, "res": 0}, "penaltyReverse": {"atk": 0, "spd": 0, "def": 0, "res": 0},
      "bonusDouble": 0 }; //effects the change during battle
    this["variableStats"] = [];
    this["variableCombat"] = [];
    this["variablePreCombat"] = [];
    this["conditionalEffects"] = []; //conditional effects which occur at the start of combat
    this["conditionalCombat"] = []; //conditional effects which occur during combat and will need to use combat stats
    this["conditionalSpecial"] = [];
    this["initiating"] = false;
    this["warp"] = [];
    this["onAssist"] = [];
    this["onSpecial"] = [];
    this["turnStart"] = [];
    this["battleMovement"] = {};
    this["onAttack"] = [];
    this["postCombat"] = [];
    this["specialActivated"] = false;
    this["combatCount"] = 0;
    this["moveAssistSuccess"] = false;

  }  
  return hero;
}


export default GameBoard;
