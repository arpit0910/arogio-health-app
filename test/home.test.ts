import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { homeWater } from '../src/features/home/homeModel.ts';
import { emptyWellness, type WaterPlan } from '../src/features/wellness/domain.ts';
const plan: WaterPlan = { version:'home', wakeTime:'07:00', sleepTime:'23:00', timezone:'Asia/Kolkata',targetMl:2000,servingMl:250,remindersEnabled:true,pausedUntil:null };
describe('Daily mobile Home',()=>{
  it('does not invent activity before water setup or expose cycle records',()=>{
    const data={...emptyWellness(),periods:[{id:'private',startDate:'2026-10-01',endDate:null}]};
    assert.equal(homeWater(data,new Date('2026-10-28T05:00:00Z')),null);
    const view=homeWater({...data,waterPlan:plan},new Date('2026-10-28T05:00:00Z'))!;
    assert.equal(view.totalMl,0);assert.equal(view.logs.length,0);assert.ok(!JSON.stringify(view).includes('private'));
  });
  it('shows only current waking-day water, sorted activity and up to two upcoming tasks',()=>{
    const data={...emptyWellness(),waterPlan:plan,waterLogs:[
      {id:'old',amountMl:1000,day:'2026-10-27',targetMl:2000,taskId:null,loggedAt:'2026-10-27T10:00:00Z'},
      {id:'first',amountMl:250,day:'2026-10-28',targetMl:2000,taskId:null,loggedAt:'2026-10-28T03:00:00Z'},
      {id:'latest',amountMl:300,day:'2026-10-28',targetMl:2000,taskId:null,loggedAt:'2026-10-28T04:00:00Z'}]};
    const view=homeWater(data,new Date('2026-10-28T05:00:00Z'))!;
    assert.equal(view.totalMl,550);assert.equal(view.logs[0].id,'latest');assert.equal(view.next.length,2);assert.ok(view.next.every(t=>Date.parse(t.at)>Date.parse('2026-10-28T05:00:00Z')));assert.equal(view.completedTasks,2);
  });
  it('handles overnight days, pauses and amounts above target without overflowing progress',()=>{
    const overnight={...plan,wakeTime:'18:00',sleepTime:'06:00',pausedUntil:'2026-10-29T00:30:00Z'};
    const view=homeWater({...emptyWellness(),waterPlan:overnight,waterLogs:[{id:'1',amountMl:2250,day:'2026-10-28',targetMl:2000,taskId:null,loggedAt:'2026-10-28T21:30:00Z'}]},new Date('2026-10-28T22:00:00Z'))!;
    assert.equal(view.day,'2026-10-28');assert.equal(view.progress,1);assert.equal(view.complete,true);assert.equal(view.paused,true);
  });
});
