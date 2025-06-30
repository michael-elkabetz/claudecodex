import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, GitBranch, Download, Code, GitPullRequest, Trash2, ExternalLink, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";

interface ProcessAnimationProps {
  isVisible: boolean;
  isComplete: boolean;
  hasError: boolean;
  prUrl?: string;
  onReset?: () => void;
  isExistingBranch?: boolean;
}

const steps = [
  {
    id: 1,
    title: "Create Branch",
    icon: GitBranch,
    description: "Creating a new branch for your changes",
    color: "#10B981", // green
    duration: 7000 // 7 seconds
  },
  {
    id: 2,
    title: "Clone Branch",
    icon: Download,
    description: "Cloning repository to workspace",
    color: "#3B82F6", // blue
    duration: 7000 // 7 seconds
  },
  {
    id: 3,
    title: "Code Changes",
    icon: Code,
    description: "Implementing your requested changes",
    color: "#8B5CF6", // purple
    duration: -1 // Wait for actual completion
  },
  {
    id: 4,
    title: "Create Pull Request",
    icon: GitPullRequest,
    description: "Creating pull request with your changes",
    color: "#F59E0B", // orange
    duration: 5000 // 5 seconds
  },
  {
    id: 5,
    title: "Clean Up",
    icon: Trash2,
    description: "Cleaning up temporary files",
    color: "#EF4444", // red
    duration: 4000 // 4 seconds
  }
];

const ProcessAnimation = ({ isVisible, isComplete, hasError, prUrl, onReset, isExistingBranch }: ProcessAnimationProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Always use all steps
  const activeSteps = steps;

  useEffect(() => {
    if (!isVisible || hasError || isComplete) {
      if (!isVisible) {
        // Reset state when component is hidden
        setIsProcessing(false);
        setCurrentStep(0);
        setCompletedSteps([]);
      }
      return;
    }

    if (!isProcessing) {
      setIsProcessing(true);
      setCurrentStep(0);
      setCompletedSteps([]);
      startProcessing();
    }
  }, [isVisible, hasError, isComplete]);

  // Remove this useEffect as it conflicts with the proper timing logic
  // The continueAfterCodeChanges function will handle completion properly

  const startProcessing = async () => {
    if (isExistingBranch) {
      // For existing branch, mark first 2 steps as complete and start from step 3
      setCompletedSteps([1, 2]);
      setCurrentStep(3);
      // Code changes step will be completed when isComplete becomes true
    } else {
      // For new branch: start with branch creation (step 1)
      setCurrentStep(1);
      await new Promise(resolve => setTimeout(resolve, 7000));
      setCompletedSteps(prev => [...prev, 1]);

      // Step 2: Clone Branch (7 seconds)
      setCurrentStep(2);
      await new Promise(resolve => setTimeout(resolve, 7000));
      setCompletedSteps(prev => [...prev, 2]);

      // Step 3: Code Changes (wait for completion)
      setCurrentStep(3);
      // This step will be completed when isComplete becomes true
    }
  };

  useEffect(() => {
    if (isComplete && currentStep === 3 && !completedSteps.includes(3)) {
      // Code changes completed, continue with remaining steps
      continueAfterCodeChanges();
    }
  }, [isComplete, currentStep, completedSteps]);

  const continueAfterCodeChanges = async () => {
    setCompletedSteps(prev => [...prev, 3]);

    // Step 4: Create Pull Request (5 seconds)
    setCurrentStep(4);
    await new Promise(resolve => setTimeout(resolve, 5000));
    setCompletedSteps(prev => [...prev, 4]);

    // Step 5: Clean Up (4 seconds)
    setCurrentStep(5);
    await new Promise(resolve => setTimeout(resolve, 4000));
    setCompletedSteps(prev => [...prev, 5]);
    
    setCurrentStep(-1);
  };

  if (!isVisible) return null;

  const getStepStatus = (stepId: number) => {
    if (completedSteps.includes(stepId)) return 'completed';
    if (currentStep === stepId) return 'active';
    return 'pending';
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{ duration: 0.5 }}
        className="w-full lg:w-80 lg:sticky lg:top-20"
      >
        <Card className="shadow-lg bg-white border-gray-200 h-auto lg:h-[470px]">
          <CardContent className="p-4 h-full flex flex-col">
            {hasError ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center space-y-4 flex flex-col justify-center h-full"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto"
                >
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <h3 className="text-xl font-bold text-red-700 mb-2">Process Failed</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Something went wrong while processing your request. Please try again.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="space-y-3"
                >
                  {onReset && (
                    <Button
                      onClick={onReset}
                      variant="outline"
                      className="w-full"
                    >
                      Try Again
                    </Button>
                  )}
                </motion.div>
              </motion.div>
            ) : isComplete && completedSteps.length === activeSteps.length ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center space-y-4 flex flex-col justify-center h-full"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto"
                >
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <h3 className="text-xl font-bold text-green-700 mb-2">Your PR Is Ready! 🎉</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Your code changes have been implemented and the pull request is ready for review.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="space-y-3"
                >
                  {prUrl && (
                    <Button
                      onClick={() => window.open(prUrl, '_blank')}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Pull Request
                    </Button>
                  )}
                  
                  {onReset && (
                    <Button
                      onClick={onReset}
                      variant="outline"
                      className="w-full"
                    >
                      Create Another PR
                    </Button>
                  )}
                </motion.div>
              </motion.div>
            ) : (
              <>
                <div className="text-center mb-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3"
                  >
                    <Code className="w-3 h-3 text-white" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-gray-800">Code Agent Is Working...</h3>
                  <p className="text-xs text-gray-500">This process may take several minutes</p>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto">
                  {activeSteps.map((step, index) => {
                    const status = getStepStatus(step.id);
                    
                    return (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0.3, scale: 0.95 }}
                        animate={{ 
                          opacity: status === 'pending' ? 0.3 : 1, 
                          scale: 1,
                        }}
                        className="relative"
                      >
                        {/* Connection Line */}
                        {index < activeSteps.length - 1 && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ 
                              height: status === 'completed' ? "1.25rem" : 0,
                            }}
                            transition={{ duration: 0.5 }}
                            className="absolute left-4 top-10 w-0.5 bg-gray-300 z-0"
                            style={{
                              background: `repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, #d1d5db 2px, #d1d5db 4px)`
                            }}
                          />
                        )}

                        <div className="flex items-center space-x-3 relative z-10 w-full">
                          <motion.div
                            initial={{ backgroundColor: "#e5e7eb" }}
                            animate={{ 
                              backgroundColor: status === 'completed' ? step.color : 
                                             status === 'active' ? step.color : "#e5e7eb"
                            }}
                            transition={{ duration: 0.5 }}
                            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          >
                            {status === 'completed' ? (
                              <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                              >
                                <CheckCircle className="w-4 h-4 text-white" />
                              </motion.div>
                            ) : status === 'active' ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              >
                                <Loader2 className="w-4 h-4 text-white" />
                              </motion.div>
                            ) : (
                              <motion.div
                                initial={{ opacity: 0.3 }}
                                animate={{ opacity: 0.3 }}
                              >
                                <step.icon className="w-4 h-4 text-gray-400" />
                              </motion.div>
                            )}
                          </motion.div>

                          <div className="flex-1 min-w-0">
                            <motion.h4
                              initial={{ opacity: 0.5 }}
                              animate={{ 
                                opacity: status === 'pending' ? 0.5 : 1,
                              }}
                              className="font-semibold text-gray-800 leading-tight"
                            >
                              {step.title}
                            </motion.h4>
                            <motion.p
                              initial={{ opacity: 0.3 }}
                              animate={{ 
                                opacity: status === 'pending' ? 0.3 : 0.8,
                              }}
                              className="text-xs text-gray-600 mt-1 leading-relaxed"
                            >
                              {step.description}
                            </motion.p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProcessAnimation; 