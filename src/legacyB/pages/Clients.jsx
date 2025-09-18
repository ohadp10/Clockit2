
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Users,
  Plus,
  Settings,
  Video,
  ExternalLink,
  Loader2,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Save
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Client } from '@/legacyB/_compat/entities';
import { VideoAsset } from '@/legacyB/_compat/entities';
import { ScheduledPost } from '@/legacyB/_compat/entities';
import { User } from '@/legacyB/_compat/entities';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [videos, setVideos] = useState([]);
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [editingClient, setEditingClient] = useState(null);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [newClient, setNewClient] = useState({
    name: '',
    description: '',
    logo_url: ''
  });

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        // legacy provider removed
        const user = await User.me();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error loading current user:', error);
        // Optionally handle error, e.g., redirect to login or show message
      }
    };

    loadCurrentUser();
  }, []); // Empty dependency array means this runs once on mount

  // New: Effect for debouncing the search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Refactored data loading function using useCallback
  const loadUserData = useCallback(async () => {
    if (!currentUser) {
      // If currentUser is not available yet, we can't fetch user-specific data.
      // The useEffect below will call this again once currentUser is set.
      return;
    }

    setIsLoading(true);
    try {
      // הוסף delay קטן כדי למנוע overload
      await new Promise(resolve => setTimeout(resolve, 100)); // Added delay as requested
      
      const [myClients, sampleClients, fetchedVideos, fetchedPosts] = await Promise.all([
        Client.filter({ owner_email: currentUser.email }), // Filter by owner_email
        Client.filter({ owner_email: "user@example.com" }), // Fetch sample clients
        VideoAsset.list(), // Fetch all videos (will be filtered later)
        ScheduledPost.list() // Fetch all posts (will be filtered later)
      ]);

      const clientMap = new Map();
      myClients.forEach(client => clientMap.set(client.id, client));
      sampleClients.forEach(client => {
          if (!clientMap.has(client.id)) { // Prevent duplicates if a sample client ID somehow clashes with a user client ID (unlikely but safe)
              clientMap.set(client.id, client);
          }
      });
      const allFetchedClients = Array.from(clientMap.values());

      setClients(allFetchedClients);

      // מסנן וידאו ופוסטים שקשורים ללקוחות של המשתמש הנוכחי
      const clientIds = allFetchedClients.map(c => c.id);
      setVideos(fetchedVideos.filter(v => clientIds.includes(v.client_id)));
      setPosts(fetchedPosts.filter(p => clientIds.includes(p.client_id)));

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]); // Dependency array: load data when currentUser changes

  useEffect(() => {
    loadUserData();
  }, [loadUserData]); // Dependency array: call loadUserData when the memoized function itself changes (which is only when currentUser changes due to useCallback)

  const handleAddClient = async () => {
    if (!newClient.name.trim()) {
      alert('אנא הזן שם לקוח');
      return;
    }

    if (!currentUser) { // New: Check if current user is available
      alert('שגיאה: לא ניתן לזהות את המשתמש הנוכחי. אנא רענן את העמוד.');
      return;
    }

    setIsLoading(true);
    try {
      // legacy provider removed
      await Client.create({
        ...newClient,
        owner_email: currentUser.email, // New: Save current user's email as owner
        social_accounts: {
          tiktok: false,
          instagram: false,
          facebook: false,
          youtube: false
        }
      });

      setShowAddDialog(false);
      setNewClient({ name: '', description: '', logo_url: '' });

      // Refresh data after adding by calling the centralized loadUserData
      await loadUserData();

    } catch (error) {
      console.error('Error creating client:', error);
      alert('אירעה שגיאה ביצירת הלקוח');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
  };

  const handleUpdateClient = async () => {
    if (!editingClient || !editingClient.name.trim()) {
      alert('שם הלקוח הוא שדה חובה.');
      return;
    }
    setIsLoading(true);
    try {
      // legacy provider removed
      // No need to update owner_email here, as it's set on creation
      await Client.update(editingClient.id, {
        name: editingClient.name,
        description: editingClient.description,
        logo_url: editingClient.logo_url
      });

      // Reload data after update by calling the centralized loadUserData
      await loadUserData();

      // Close the dialog after data reload to avoid transient null access
      setEditingClient(null);

    } catch (error) {
      console.error('Error updating client:', error);
      alert('אירעה שגיאה בעדכון הלקוח');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!clientToDelete) return;
    try {
      // legacy provider removed
      await Client.delete(clientToDelete.id);
      setClientToDelete(null);
      // Reload data after delete by calling the centralized loadUserData
      await loadUserData();

    } catch (error) {
      console.error('Error deleting client:', error);
      alert('אירעה שגיאה במחיקת הלקוח');
    }
  };

  const getClientStats = (clientId) => {
    const clientVideos = videos.filter(v => v.client_id === clientId);
    const clientPosts = posts.filter(p => p.client_id === clientId);
    return {
      videos: clientVideos.length,
      scheduledPosts: clientPosts.filter(p => p.status === 'scheduled').length,
      publishedPosts: clientPosts.filter(p => p.status === 'published').length
    };
  };

  const getConnectedPlatforms = (socialAccounts) => {
    if (!socialAccounts) return [];
    return Object.entries(socialAccounts)
      .filter(([platform, connected]) => connected)
      .map(([platform]) => platform);
  };

  // Use the debounced search term for filtering clients
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    client.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  // If no current user, display a loading message
  if (!currentUser) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">טוען נתוני משתמש...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              ניהול הלקוחות שלי ({filteredClients.length})
            </CardTitle>

            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="חפש לקוח..."
                  value={searchTerm} // Input uses the immediate searchTerm
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Button onClick={() => setShowAddDialog(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 flex-shrink-0">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">לקוח חדש</span>
              </Button>
            </div>
          </div>
          {/* New: Description for user isolation */}
          <div className="text-sm text-gray-600">
            רק אתה יכול לראות ולנהל את הלקוחות שיצרת
          </div>
        </CardHeader>
      </Card>

      {/* Clients Grid */}
      {isLoading && clients.length === 0 ? ( // Show loading indicator if data is loading and no clients are present yet
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">טוען נתוני לקוחות...</p>
          </CardContent>
        </Card>
      ) : filteredClients.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {clients.length === 0 ? 'טרם נוספו לקוחות' : 'לא נמצאו לקוחות'}
            </h3>
            <p className="text-gray-500 mb-6">
              {clients.length === 0
                ? 'התחל על ידי הוספת הלקוח הראשון שלך'
                : 'נסה מונח חיפוש אחר או נקה את החיפוש'
              }
            </p>
            {clients.length === 0 && (
              <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                הוסף לקוח ראשון
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => {
            const stats = getClientStats(client.id);
            const connectedPlatforms = getConnectedPlatforms(client.social_accounts);

            return (
              <Card key={client.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group flex flex-col">
                <CardContent className="p-6 flex-grow">
                  {/* Client Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {client.logo_url ? (
                        <img
                          src={client.logo_url}
                          alt={client.name}
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-lg">
                            {client.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                          {client.name}
                        </h3>
                        <Badge variant={client.status === 'active' ? 'default' : 'secondary'} className="mt-1">
                          {client.status === 'active' ? 'פעיל' : client.status === 'pending' ? 'ממתין' : 'מושהה'}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-8 h-8 opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>פעולות</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEditClient(client)}>
                          <Edit className="w-4 h-4 ml-2" />
                          ערוך פרטים
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={createPageUrl(`ClientConnect?id=${client.id}`)} className="flex items-center">
                            <ExternalLink className="w-4 h-4 ml-2" />
                            חיבור רשתות
                          </Link>
                        </DropdownMenuItem>
                        {/* Only allow deletion for clients owned by the current user */}
                        {client.owner_email === currentUser.email && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setClientToDelete(client)}
                              className="text-red-500 focus:text-red-500 focus:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 ml-2" />
                              מחק לקוח
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Description */}
                  {client.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {client.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{stats.videos}</div>
                      <div className="text-xs text-gray-500">וידאו</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-600">{stats.scheduledPosts}</div>
                      <div className="text-xs text-gray-500">מתוזמן</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{stats.publishedPosts}</div>
                      <div className="text-xs text-gray-500">פורסם</div>
                    </div>
                  </div>

                  {/* Connected Platforms */}
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500 font-medium">רשתות מחוברות:</div>
                    {connectedPlatforms.length === 0 ? (
                      <p className="text-xs text-red-500">לא מחוברות רשתות חברתיות</p>
                    ) : (
                      <div className="flex gap-1 flex-wrap">
                        {connectedPlatforms.map(platform => (
                          <Badge key={platform} variant="outline" className="text-xs">
                            {platform === 'tiktok' ? 'TT' :
                             platform === 'instagram' ? 'IG' :
                             platform === 'facebook' ? 'FB' : 'YT'}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
                <div className="p-6 pt-0">
                  {/* Actions - FIX: הוספת פונקציונליות לכפתור וידאו */}
                  <div className="flex gap-2 mt-4">
                    <Link to={createPageUrl(`ClientVideos?client_id=${client.id}`)} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
                        <Video className="w-3 h-3" />
                        <span className="truncate">תוכן</span>
                      </Button>
                    </Link>
                    <Link to={createPageUrl(`ClientConnect?id=${client.id}`)} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
                        <ExternalLink className="w-3 h-3" />
                        <span className="truncate">חיבור</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Client Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              הוספת לקוח חדש
            </DialogTitle>
            <DialogDescription>
              צור פרופיל חדש ללקוח ומאוחר יותר תוכל לחבר את הרשתות החברתיות שלו
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">שם הלקוח *</Label>
              <Input
                id="clientName"
                placeholder="לדוגמה: חברת טכנולוגיה בע״מ"
                value={newClient.name}
                onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientDesc">תיאור (אופציונלי)</Label>
              <Textarea
                id="clientDesc"
                placeholder="תיאור קצר על הלקוח ופעילותו..."
                value={newClient.description}
                onChange={(e) => setNewClient(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientLogo">כתובת לוגו (אופציונלי)</Label>
              <Input
                id="clientLogo"
                placeholder="https://example.com/logo.png"
                value={newClient.logo_url}
                onChange={(e) => setNewClient(prev => ({ ...prev, logo_url: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              disabled={isLoading}
            >
              ביטול
            </Button>
            <Button
              onClick={handleAddClient}
              disabled={isLoading || !newClient.name.trim()}
              className="gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {isLoading ? 'יוצר...' : 'צור לקוח'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={!!editingClient} onOpenChange={(isOpen) => !isOpen && setEditingClient(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-600" />
              עריכת פרטי לקוח
            </DialogTitle>
            <DialogDescription>
              עדכן את הפרטים של {editingClient?.name}
            </DialogDescription>
          </DialogHeader>

          {editingClient && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editClientName">שם הלקוח *</Label>
                <Input
                  id="editClientName"
                  value={editingClient.name}
                  onChange={(e) => setEditingClient(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editClientDesc">תיאור (אופציונלי)</Label>
                <Textarea
                  id="editClientDesc"
                  value={editingClient.description}
                  onChange={(e) => setEditingClient(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editClientLogo">כתובת לוגו (אופציונלי)</Label>
                <Input
                  id="editClientLogo"
                  value={editingClient.logo_url}
                  onChange={(e) => setEditingClient(prev => ({ ...prev, logo_url: e.target.value }))}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingClient(null)}
              disabled={isLoading}
            >
              ביטול
            </Button>
            <Button
              onClick={handleUpdateClient}
              disabled={
                isLoading || !(editingClient && editingClient.name && editingClient.name.trim())
              }
              className="gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isLoading ? 'שומר...' : 'שמור שינויים'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!clientToDelete} onOpenChange={(isOpen) => !isOpen && setClientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו תמחק את הלקוח "{clientToDelete?.name}" לצמיתות, כולל כל הסרטונים והפוסטים המשויכים אליו. לא ניתן לשחזר פעולה זו.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setClientToDelete(null)}>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClient} className="bg-red-600 hover:bg-red-700">
              כן, מחק את הלקוח
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
