import React, { useState, useEffect } from 'react';
import {
  DayOfWeek,
  FamilyMember,
  PresenceRecord,
  MealAttendanceRecord,
  Recipe,
  WeeklyMealPlanItem,
  ShoppingItem,
  PantryItem,
  ChoreDefinition,
  ChoreAssignment,
  MemberDailyCapacity,
} from './types/notion.ts';
import { AuthUser, isCsabiUser } from './types/auth.ts';
import { authService } from './services/authService.ts';
import {
  INITIAL_NOTION_MEMBERS,
  INITIAL_NOTION_RECIPES,
  INITIAL_NOTION_CHORE_DEFS,
  INITIAL_NOTION_SHOPPING,
  INITIAL_NOTION_PANTRY,
  generateInitialPresence,
  generateInitialMealAttendances,
  generateInitialCapacities,
  generateInitialMealPlan,
} from './data/notionInitialData.ts';
import { getCurrentWeekDates, distributeChoresFairly } from './utils/fairDistribution.ts';
import { NotionSidebar, NotionPageId } from './components/notion/NotionSidebar.tsx';
import { NotionHeader } from './components/notion/NotionHeader.tsx';
import { DashboardView } from './components/notion/DashboardView.tsx';
import { PresenceMatrixView } from './components/notion/PresenceMatrixView.tsx';
import { MealAttendanceView } from './components/notion/MealAttendanceView.tsx';
import { MealPlanAndCookingView } from './components/notion/MealPlanAndCookingView.tsx';
import { RecipeDatabaseView } from './components/notion/RecipeDatabaseView.tsx';
import { ShoppingListView } from './components/notion/ShoppingListView.tsx';
import { ChoresView } from './components/notion/ChoresView.tsx';
import { PersonalView } from './components/notion/PersonalView.tsx';
import { MobileTodayView } from './components/notion/MobileTodayView.tsx';
import { FamilyMembersView } from './components/notion/FamilyMembersView.tsx';
import { PantryView } from './components/notion/PantryView.tsx';
import { WeeklyOverviewView } from './components/notion/WeeklyOverviewView.tsx';
import { AdminView } from './components/notion/AdminView.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import { FamilyMemberPickerModal } from './components/auth/FamilyMemberPickerModal.tsx';

// Storage keys
const STORAGE_PREFIX = 'notion_home_v2_';

export default function App() {
  // Navigation State
  const [activePage, setActivePage] = useState<NotionPageId>('home');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedRecipeModal, setSelectedRecipeModal] = useState<Recipe | null>(null);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => authService.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(() => !authService.getCurrentUser());
  const [isMemberPickerOpen, setIsMemberPickerOpen] = useState<boolean>(false);

  // Active Member for Personal Filtering
  const [activeMemberId, setActiveMemberId] = useState<string>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}active_member`);
    if (saved) return saved;
    const initialUser = authService.getCurrentUser();
    if (initialUser?.linkedMemberId) return initialUser.linkedMemberId;
    return 'mem-csabi';
  });

  // 1. Family Members (7 members, strictly no age)
  const [members, setMembers] = useState<FamilyMember[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}members`);
    return saved ? JSON.parse(saved) : INITIAL_NOTION_MEMBERS;
  });

  // 2. Presence
  const [presence, setPresence] = useState<PresenceRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}presence`);
    return saved ? JSON.parse(saved) : generateInitialPresence();
  });

  // 3. Meal Attendance
  const [mealAttendances, setMealAttendances] = useState<MealAttendanceRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}meal_attendance`);
    return saved ? JSON.parse(saved) : generateInitialMealAttendances();
  });

  // 4. Capacities
  const [capacities, setCapacities] = useState<MemberDailyCapacity[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}capacities`);
    return saved ? JSON.parse(saved) : generateInitialCapacities();
  });

  // 5. Recipes (20+)
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}recipes`);
    return saved ? JSON.parse(saved) : INITIAL_NOTION_RECIPES;
  });

  // 6. Weekly Meal Plan
  const [mealPlan, setMealPlan] = useState<WeeklyMealPlanItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}meal_plan`);
    return saved ? JSON.parse(saved) : generateInitialMealPlan();
  });

  // 7. Shopping List
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}shopping`);
    return saved ? JSON.parse(saved) : INITIAL_NOTION_SHOPPING;
  });

  // 8. Pantry
  const [pantryItems, setPantryItems] = useState<PantryItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}pantry`);
    return saved ? JSON.parse(saved) : INITIAL_NOTION_PANTRY;
  });

  // 9. Chore Definitions (Customizable Master Task Catalog)
  const [choreDefs, setChoreDefs] = useState<ChoreDefinition[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}chore_defs`);
    return saved ? JSON.parse(saved) : INITIAL_NOTION_CHORE_DEFS;
  });

  // 10. Chore Assignments
  const [choreAssignments, setChoreAssignments] = useState<ChoreAssignment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}chore_assignments`);
    if (saved) return JSON.parse(saved);
    // Generate initial fair distribution
    return distributeChoresFairly({
      choreDefs: INITIAL_NOTION_CHORE_DEFS,
      members: INITIAL_NOTION_MEMBERS,
      presence: generateInitialPresence(),
      capacities: generateInitialCapacities(),
      weekDates: getCurrentWeekDates(),
    });
  });

  // Sync activeMemberId with currentUser if linked
  useEffect(() => {
    if (currentUser?.linkedMemberId) {
      setActiveMemberId(currentUser.linkedMemberId);
    }
  }, [currentUser]);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}active_member`, activeMemberId);
  }, [activeMemberId]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}members`, JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}presence`, JSON.stringify(presence));
  }, [presence]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}meal_attendance`, JSON.stringify(mealAttendances));
  }, [mealAttendances]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}capacities`, JSON.stringify(capacities));
  }, [capacities]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}recipes`, JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}meal_plan`, JSON.stringify(mealPlan));
  }, [mealPlan]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}shopping`, JSON.stringify(shoppingList));
  }, [shoppingList]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}pantry`, JSON.stringify(pantryItems));
  }, [pantryItems]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}chore_defs`, JSON.stringify(choreDefs));
  }, [choreDefs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}chore_assignments`, JSON.stringify(choreAssignments));
  }, [choreAssignments]);

  // ============================================================
  // Task Customization Handlers (Chore Definitions Master Catalog)
  // ============================================================
  const handleAddChoreDef = (newDef: ChoreDefinition) => {
    setChoreDefs((prev) => [newDef, ...prev]);
  };

  const handleUpdateChoreDef = (id: string, updates: Partial<ChoreDefinition>) => {
    setChoreDefs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const handleDeleteChoreDef = (id: string) => {
    setChoreDefs((prev) => prev.filter((c) => c.id !== id));
    // Also remove any existing assignments for this chore
    setChoreAssignments((prev) => prev.filter((a) => a.choreId !== id));
  };

  const handleResetDefaultChoreDefs = () => {
    setChoreDefs(INITIAL_NOTION_CHORE_DEFS);
  };

  // ============================================================
  // Task Customization Handlers (Weekly Assignments)
  // ============================================================
  const handleAddAssignment = (asgn: ChoreAssignment) => {
    setChoreAssignments((prev) => [asgn, ...prev]);
  };

  const handleUpdateAssignment = (id: string, updates: Partial<ChoreAssignment>) => {
    setChoreAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  };

  const handleDeleteAssignment = (id: string) => {
    setChoreAssignments((prev) => prev.filter((a) => a.id !== id));
  };

  // Global Actions
  const handleRunFairDistribution = () => {
    const newAssignments = distributeChoresFairly({
      choreDefs,
      members,
      presence,
      capacities,
      weekDates: getCurrentWeekDates(),
      existingAssignments: choreAssignments,
    });
    setChoreAssignments(newAssignments);
  };

  const handleApplyDefaults = () => {
    setPresence(generateInitialPresence());
    setMealAttendances(generateInitialMealAttendances());
    setCapacities(generateInitialCapacities());
    handleRunFairDistribution();
  };

  const handleGenerateShoppingListFromMenu = () => {
    const newItems: ShoppingItem[] = [...shoppingList];

    mealPlan.forEach((planItem) => {
      const recipe = recipes.find((r) => r.id === planItem.recipeId);
      if (!recipe) return;

      recipe.ingredients.forEach((ingr) => {
        const alreadyExists = newItems.some(
          (s) => s.item.toLowerCase().includes(ingr.item.toLowerCase())
        );

        if (!alreadyExists) {
          newItems.push({
            id: `shop-gen-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            item: ingr.item,
            quantity: ingr.amount.split(' ')[0] || '1',
            unit: ingr.amount.split(' ')[1] || 'adag',
            category: ingr.category || '🧂 Egyéb élelmiszer',
            relatedRecipeId: recipe.id,
            inStock: false,
            needsBuying: true,
            purchased: false,
            note: `${recipe.name} (${planItem.dayOfWeek} ${planItem.mealType})`,
          });
        }
      });
    });

    setShoppingList(newItems);
  };

  // Toggle handlers
  const handleToggleChoreComplete = (assignmentId: string) => {
    setChoreAssignments((prev) =>
      prev.map((a) => {
        if (a.id !== assignmentId) return a;
        const next = !a.completed;
        return {
          ...a,
          completed: next,
          completedAt: next ? new Date().toISOString() : undefined,
        };
      })
    );
  };

  const handleToggleShoppingItem = (itemId: string) => {
    setShoppingList((prev) =>
      prev.map((s) => (s.id === itemId ? { ...s, purchased: !s.purchased } : s))
    );
  };

  const handleUpdatePresence = (
    memberId: string,
    day: DayOfWeek,
    field: 'isHome' | 'sleepsHome' | 'arrival' | 'departure' | 'note',
    value: any
  ) => {
    setPresence((prev) =>
      prev.map((p) => {
        if (p.memberId === memberId && p.dayOfWeek === day) {
          return { ...p, [field]: value };
        }
        return p;
      })
    );
  };

  const handleToggleMeal = (
    memberId: string,
    day: DayOfWeek,
    mealType: 'wantsLunch' | 'wantsDinner'
  ) => {
    setMealAttendances((prev) =>
      prev.map((a) => {
        if (a.memberId === memberId && a.dayOfWeek === day) {
          return { ...a, [mealType]: !a[mealType] };
        }
        return a;
      })
    );
  };

  const handleUpdateMealPlan = (planId: string, updates: Partial<WeeklyMealPlanItem>) => {
    setMealPlan((prev) =>
      prev.map((p) => (p.id === planId ? { ...p, ...updates } : p))
    );
  };

  const handleAddShoppingItem = (item: Omit<ShoppingItem, 'id'>) => {
    const newItem: ShoppingItem = {
      ...item,
      id: `shop-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setShoppingList((prev) => [newItem, ...prev]);
  };

  const handleDeleteShoppingItem = (id: string) => {
    setShoppingList((prev) => prev.filter((s) => s.id !== id));
  };

  const handleToggleCanCook = (memberId: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, canCook: !m.canCook } : m))
    );
  };

  const handleToggleMemberActive = (memberId: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, active: !m.active } : m))
    );
  };

  const handleUpdateMemberNote = (memberId: string, note: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, note } : m))
    );
  };

  const handleUpdateCapacity = (memberId: string, day: DayOfWeek, minutes: number) => {
    setCapacities((prev) =>
      prev.map((c) => {
        if (c.memberId === memberId && c.dayOfWeek === day) {
          return { ...c, availableMinutes: minutes };
        }
        return c;
      })
    );
  };

  const handleReassignChore = (assignmentId: string, newMemberId: string) => {
    setChoreAssignments((prev) =>
      prev.map((a) => (a.id === assignmentId ? { ...a, memberId: newMemberId } : a))
    );
  };

  const handleAddRecipeIngredientsToShopping = (recipe: Recipe) => {
    const newItems: ShoppingItem[] = [...shoppingList];
    recipe.ingredients.forEach((ingr) => {
      newItems.push({
        id: `shop-rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        item: ingr.item,
        quantity: ingr.amount.split(' ')[0] || '1',
        unit: ingr.amount.split(' ')[1] || 'adag',
        category: ingr.category || '🧂 Egyéb élelmiszer',
        relatedRecipeId: recipe.id,
        inStock: false,
        needsBuying: true,
        purchased: false,
        note: `Receptből: ${recipe.name}`,
      });
    });
    setShoppingList(newItems);
  };

  const handleAddPantryItem = (item: PantryItem) => {
    setPantryItems((prev) => [item, ...prev]);
  };

  const handleTogglePantryStock = (id: string) => {
    setPantryItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, inStock: !p.inStock } : p))
    );
  };

  const handleDeletePantryItem = (id: string) => {
    setPantryItems((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSendPantryToShopping = (pantryItem: PantryItem) => {
    handleAddShoppingItem({
      item: pantryItem.item,
      quantity: pantryItem.minQuantity || '1',
      unit: 'db',
      category: pantryItem.category,
      inStock: false,
      needsBuying: true,
      purchased: false,
      note: 'Kifogyott a kamrából',
    });
  };

  // Auth Handlers
  const handleAuthSuccess = (user: AuthUser, needsMemberSelection?: boolean) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);

    if (needsMemberSelection || !user.linkedMemberId) {
      setIsMemberPickerOpen(true);
    } else {
      setActiveMemberId(user.linkedMemberId);
    }
  };

  const handleSelectFamilyMember = (memberId: string) => {
    if (currentUser) {
      const updated = authService.linkUserToMember(currentUser.id, memberId);
      if (updated) {
        setCurrentUser(updated);
      }
    }
    setActiveMemberId(memberId);
    setIsMemberPickerOpen(false);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsAuthModalOpen(true);
  };

  const activeMember = members.find((m) => m.id === activeMemberId) || members[0];

  const pageTitles: Record<NotionPageId, { title: string; icon: string }> = {
    home: { title: 'Főoldal — Családi Otthon', icon: '🏠' },
    week_plan: { title: 'E Heti Családi Terv', icon: '📅' },
    presence: { title: 'Otthonlét Mátrix', icon: '📍' },
    meal_attendance: { title: 'Étkezési Igények (Ebéd & Vacsora)', icon: '🍱' },
    meal_plan: { title: 'Heti Menü & Főzés Beosztás', icon: '👩‍🍳' },
    recipes: { title: 'Receptek (20+ családbarát recept)', icon: '📖' },
    shopping: { title: 'Bevásárlólista', icon: '🛒' },
    chores: { title: 'Házimunka & Igazságos Beosztás', icon: '🧹' },
    personal: { title: `Saját Feladataim (${activeMember.name})`, icon: '👤' },
    pantry: { title: 'Háztartási Készlet', icon: '📦' },
    mobile_today: { title: 'MA — Mobil Fókusz', icon: '📱' },
    family_members: { title: 'Családtagok (7 fő)', icon: '👨‍👩‍👧‍👦' },
    admin: { title: 'Adminisztrációs Központ (Csabi)', icon: '⚙️' },
  };

  return (
    <div className="min-h-screen bg-[#fcfcfb] text-slate-800 flex font-sans antialiased">
      {/* Notion Sidebar Navigation */}
      <NotionSidebar
        activePage={activePage}
        onSelectPage={setActivePage}
        isOpenMobile={isMobileSidebarOpen}
        onToggleMobile={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        selectedMemberName={activeMember.name}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenMemberPicker={() => setIsMemberPickerOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <NotionHeader
          onToggleMobileMenu={() => setIsMobileSidebarOpen(true)}
          pageTitle={pageTitles[activePage].title}
          pageIcon={pageTitles[activePage].icon}
          members={members}
          activeMemberId={activeMemberId}
          onSelectMember={setActiveMemberId}
          currentUser={currentUser}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenMemberPicker={() => setIsMemberPickerOpen(true)}
          onLogout={handleLogout}
          onNavigateToAdmin={() => setActivePage('admin')}
          onApplyDefaults={handleApplyDefaults}
          onRunFairDistribution={handleRunFairDistribution}
          onGenerateShoppingList={handleGenerateShoppingListFromMenu}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 overflow-y-auto pb-16">
          {activePage === 'home' && (
            <DashboardView
              members={members}
              presence={presence}
              mealAttendances={mealAttendances}
              mealPlan={mealPlan}
              recipes={recipes}
              shoppingList={shoppingList}
              choreAssignments={choreAssignments}
              activeMemberId={activeMemberId}
              onToggleChoreComplete={handleToggleChoreComplete}
              onToggleShoppingItem={handleToggleShoppingItem}
              onNavigatePage={setActivePage}
              onSelectMember={setActiveMemberId}
            />
          )}

          {activePage === 'week_plan' && (
            <WeeklyOverviewView
              members={members}
              presence={presence}
              mealAttendances={mealAttendances}
              mealPlan={mealPlan}
              recipes={recipes}
              shoppingList={shoppingList}
              assignments={choreAssignments}
            />
          )}

          {activePage === 'presence' && (
            <PresenceMatrixView
              members={members}
              presence={presence}
              onUpdatePresence={handleUpdatePresence}
              onResetDefaults={handleApplyDefaults}
            />
          )}

          {activePage === 'meal_attendance' && (
            <MealAttendanceView
              members={members}
              mealAttendances={mealAttendances}
              onToggleMeal={handleToggleMeal}
              onResetDefaults={handleApplyDefaults}
            />
          )}

          {activePage === 'meal_plan' && (
            <MealPlanAndCookingView
              mealPlan={mealPlan}
              recipes={recipes}
              members={members}
              mealAttendances={mealAttendances}
              onUpdateMealPlan={handleUpdateMealPlan}
              onOpenRecipeModal={setSelectedRecipeModal}
            />
          )}

          {activePage === 'recipes' && (
            <RecipeDatabaseView
              recipes={recipes}
              onAddRecipeIngredientsToShopping={handleAddRecipeIngredientsToShopping}
              selectedModalRecipe={selectedRecipeModal}
              onSelectModalRecipe={setSelectedRecipeModal}
            />
          )}

          {activePage === 'shopping' && (
            <ShoppingListView
              shoppingList={shoppingList}
              members={members}
              onTogglePurchased={handleToggleShoppingItem}
              onAddItem={handleAddShoppingItem}
              onDeleteItem={handleDeleteShoppingItem}
              onGenerateFromMenu={handleGenerateShoppingListFromMenu}
              onToggleInStock={() => {}}
            />
          )}

          {activePage === 'chores' && (
            <ChoresView
              choreDefs={choreDefs}
              assignments={choreAssignments}
              members={members}
              capacities={capacities}
              onToggleAssignmentComplete={handleToggleChoreComplete}
              onRunFairDistribution={handleRunFairDistribution}
              onUpdateCapacity={handleUpdateCapacity}
              onReassignChore={handleReassignChore}
              onAddChoreDef={handleAddChoreDef}
              onUpdateChoreDef={handleUpdateChoreDef}
              onDeleteChoreDef={handleDeleteChoreDef}
              onAddAssignment={handleAddAssignment}
              onUpdateAssignment={handleUpdateAssignment}
              onDeleteAssignment={handleDeleteAssignment}
            />
          )}

          {activePage === 'personal' && (
            <PersonalView
              members={members}
              activeMemberId={activeMemberId}
              onSelectMember={setActiveMemberId}
              assignments={choreAssignments}
              mealPlan={mealPlan}
              mealAttendances={mealAttendances}
              presence={presence}
              recipes={recipes}
              onToggleChoreComplete={handleToggleChoreComplete}
            />
          )}

          {activePage === 'mobile_today' && (
            <MobileTodayView
              members={members}
              presence={presence}
              mealAttendances={mealAttendances}
              mealPlan={mealPlan}
              recipes={recipes}
              shoppingList={shoppingList}
              choreAssignments={choreAssignments}
              activeMemberId={activeMemberId}
              onSelectMember={setActiveMemberId}
              onToggleChoreComplete={handleToggleChoreComplete}
              onToggleShoppingItem={handleToggleShoppingItem}
            />
          )}

          {activePage === 'family_members' && (
            <FamilyMembersView
              members={members}
              onToggleCanCook={handleToggleCanCook}
              onToggleActive={handleToggleMemberActive}
              onUpdateNote={handleUpdateMemberNote}
            />
          )}

          {activePage === 'pantry' && (
            <PantryView
              pantryItems={pantryItems}
              onToggleInStock={handleTogglePantryStock}
              onAddItem={handleAddPantryItem}
              onDeleteItem={handleDeletePantryItem}
              onSendLowStockToShopping={handleSendPantryToShopping}
            />
          )}

          {activePage === 'admin' && (
            <AdminView
              currentUser={currentUser}
              members={members}
              choreDefs={choreDefs}
              assignments={choreAssignments}
              onAddChoreDef={handleAddChoreDef}
              onUpdateChoreDef={handleUpdateChoreDef}
              onDeleteChoreDef={handleDeleteChoreDef}
              onResetDefaultChoreDefs={handleResetDefaultChoreDefs}
              onAddAssignment={handleAddAssignment}
              onUpdateAssignment={handleUpdateAssignment}
              onDeleteAssignment={handleDeleteAssignment}
              onRunFairDistribution={handleRunFairDistribution}
              onToggleCanCook={handleToggleCanCook}
              onToggleMemberActive={handleToggleMemberActive}
              onUpdateMemberNote={handleUpdateMemberNote}
              onSwitchToCsabi={() => {
                const res = authService.loginWithGoogle({
                  email: 'csabi.csalad@gmail.com',
                  name: 'Csabi',
                  memberId: 'mem-csabi',
                });
                setCurrentUser(res.user);
                setActiveMemberId('mem-csabi');
              }}
              onNavigateHome={() => setActivePage('home')}
            />
          )}
        </main>
      </div>

      {/* Auth Modal (shown on top when user is not authenticated or manually opened) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onSuccess={handleAuthSuccess}
        members={members}
        onClose={() => setIsAuthModalOpen(false)}
        canDismiss={currentUser !== null}
      />

      {/* Family Member Picker Modal (onboarding to choose family identity) */}
      <FamilyMemberPickerModal
        isOpen={isMemberPickerOpen}
        currentUser={currentUser}
        members={members}
        onSelectMember={handleSelectFamilyMember}
        onClose={() => setIsMemberPickerOpen(false)}
        isMandatory={currentUser !== null && !currentUser.linkedMemberId}
      />
    </div>
  );
}
