"""Pure scoped readiness aggregation. Recommendations never create gate decisions."""
import copy,json,argparse
from provenance import ROOT,file_hash

def gate_exit(gate,evidence_sufficient,issues):
 if gate.get('decision')!='accept':return 2
 if not gate.get('decisionRef') or not gate.get('scope') or not gate.get('evidenceRefs') or not evidence_sufficient or any(i.get('severity') in ('S0','S1') and i.get('inScope',True) and not i.get('resolved') for i in issues):return 1
 return 0

def backlog_errors(item):
 required=('id','requirementIds','findingIds','outcome','files','contractChanges','stateChanges','dependsOn','exceptionBehavior','acceptanceCommands','acceptanceScenarios','evidenceRefs','estimateAssumptions','scopeStatus')
 errors=[key for key in required if key not in item or item[key] is None or (not item[key] and key not in ('dependsOn',))]
 if item.get('scopeStatus')=='accepted' and not item.get('decisionRef'):errors.append('accepted scope requires applicable decision')
 return errors

def assess(tasks,gates,issues,decisions=None):
 tasks=copy.deepcopy(tasks);issues=copy.deepcopy(issues);decisions=copy.deepcopy(decisions or [])
 sufficient=all(t.get('evidenceStatus')=='sufficient' for t in tasks)
 summary={state:[t['id'] for t in tasks if t.get('automationStatus')==state] for state in ('done','running','todo','blocked')}
 results=[]
 for gate in copy.deepcopy(gates):
  code=gate_exit(gate,sufficient,issues);results.append({**gate,'checklist':{'automationDone':len(summary['done']),'evidenceSufficient':sufficient,'unresolvedCritical':[i['id'] for i in issues if not i.get('resolved')]},'recommendation':'accept' if code==0 else 'revise','assessmentExit':code})
 ordinary=[t for t in tasks if t['id']!='R14'];done=set(summary['done']);runnable=sorted([t for t in ordinary if t.get('automationStatus')=='running' or t.get('automationStatus')=='todo' and set(t.get('requiresArtifacts',[]))<=done],key=lambda t:t.get('order',0))
 return {'automationSummary':summary,'gates':results,'criticalIssues':issues,'decisionHistory':decisions,'nextRunnableTask':runnable[0]['id'] if runnable else None,'deferrals':[{'scope':d.get('scope'),'decisionRef':d.get('decisionRef'),'liveAIValidated':False} for d in decisions if d.get('type')=='D1' and d.get('decisionRef')],'evidenceSufficient':sufficient}

def reassess(previous,tasks,gates,issues,new_decision):
 history=copy.deepcopy(previous.get('decisionHistory',[]));history.append(copy.deepcopy(new_decision));result=assess(tasks,gates,issues,history);result['previousAssessment']=copy.deepcopy(previous);return result
if __name__=='__main__':
 print('Use build_readiness.py after completing ordinary tasks; this module exposes pure assessment functions.')
